package com.cloudvault.file.service;

import com.cloudvault.activity.service.ActivityLogService;
import com.cloudvault.file.dto.StorageUsageResponse;
import com.cloudvault.file.entity.File;
import com.cloudvault.file.entity.StoredObject;
import com.cloudvault.file.repository.FileRepository;
import com.cloudvault.file.repository.StoredObjectRepository;
import com.cloudvault.folder.entity.Folder;
import com.cloudvault.folder.repository.FolderRepository;
import com.cloudvault.sharing.entity.FileShare;
import com.cloudvault.sharing.entity.Permission;
import com.cloudvault.sharing.repository.FileShareRepository;
import com.cloudvault.sharing.entity.PublicLink;
import com.cloudvault.sharing.repository.PublicLinkRepository;
import com.cloudvault.user.entity.User;
import com.cloudvault.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final StoredObjectRepository storedObjectRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final FolderRepository folderRepository;
    private final FileShareRepository fileShareRepository;
    private final PublicLinkRepository publicLinkRepository;
    private final HashService hashService;
    private final ActivityLogService activityLogService;
    private final FileNameService fileNameService;

    public FileService(
            FileRepository fileRepository,
            StoredObjectRepository storedObjectRepository,
            UserRepository userRepository,
            StorageService storageService,
            FolderRepository folderRepository,
            FileShareRepository fileShareRepository,
            PublicLinkRepository publicLinkRepository,
            HashService hashService,
            ActivityLogService activityLogService,
            FileNameService fileNameService) {

        this.fileRepository = fileRepository;
        this.storedObjectRepository = storedObjectRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.folderRepository = folderRepository;
        this.fileShareRepository = fileShareRepository;
        this.publicLinkRepository = publicLinkRepository;
        this.hashService = hashService;
        this.activityLogService = activityLogService;
        this.fileNameService = fileNameService;
    }

    // =========================
    // Upload File
    // =========================

    public File uploadFile(
            MultipartFile multipartFile,
            Long folderId,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Validate empty file
        if (multipartFile.isEmpty()) {
            throw new RuntimeException(
                    "File cannot be empty"
            );
        }

        // Validate file size
        if (multipartFile.getSize() > 50 * 1024 * 1024) {
            throw new RuntimeException(
                    "File size cannot exceed 50 MB"
            );
        }

        // Get safe filename
        String safeFileName =
                fileNameService.getSafeFileName(multipartFile);

        // Safe content type fallback
        String contentType = multipartFile.getContentType();

        if (contentType == null ||
                contentType.trim().isEmpty()) {

            contentType = "application/octet-stream";
        }

        // =========================
        // Folder validation
        // =========================

        Folder folder = null;

        if (folderId != null) {

            folder = folderRepository.findById(folderId)
                    .orElseThrow(() ->
                            new RuntimeException("Folder not found"));

            if (!folder.getOwner().getId().equals(user.getId())) {
                throw new RuntimeException(
                        "You do not have permission to upload to this folder"
                );
            }
        }

        // =========================
        // Calculate SHA-256 hash
        // =========================

        String fileHash =
                hashService.calculateHash(multipartFile);

        // =========================
        // Check existing stored object
        // =========================

        StoredObject storedObject =
                storedObjectRepository.findByFileHash(fileHash)
                        .orElse(null);

        // =========================
        // Reuse existing object
        // =========================

        if (storedObject != null) {

            storedObject.setReferenceCount(
                    storedObject.getReferenceCount() + 1
            );

            storedObjectRepository.save(storedObject);
        }

        // =========================
        // Upload new object
        // =========================

        else {

            String storageKey =
                    UUID.randomUUID().toString();

            storageService.uploadFile(
                    storageKey,
                    multipartFile
            );

            storedObject = StoredObject.builder()
                    .fileHash(fileHash)
                    .storageKey(storageKey)
                    .size(multipartFile.getSize())
                    .referenceCount(1L)
                    .build();

            storedObject =
                    storedObjectRepository.save(storedObject);
        }

        // =========================
        // Create File metadata
        // =========================

        File file = File.builder()
                .originalName(safeFileName)
                .contentType(contentType)
                .size(multipartFile.getSize())
                .owner(user)
                .folder(folder)
                .storedObject(storedObject)
                .createdAt(LocalDateTime.now())
                .build();

        File savedFile =
                fileRepository.save(file);

        // =========================
        // Activity Log
        // =========================

        activityLogService.log(
                user,
                "FILE_UPLOADED",
                "Uploaded file: "
                        + savedFile.getOriginalName(),
                savedFile.getId(),
                folder != null
                        ? folder.getId()
                        : null
        );

        return savedFile;
    }

    // =========================
    // Download File Data
    // =========================

    public byte[] downloadFileData(File file) {

        return storageService.downloadFile(
                file.getStoredObject().getStorageKey()
        );
    }

    // =========================
    // Get My Files
    // =========================

    public List<File> getMyFiles(
            Long folderId,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Root level
        if (folderId == null) {

            return fileRepository
                    .findByOwnerAndFolderIsNull(user);
        }

        // Find requested folder
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() ->
                        new RuntimeException("Folder not found"));

        // Security check
        if (!folder.getOwner().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You do not have permission to access this folder"
            );
        }

        // Return files inside folder
        return fileRepository.findByOwnerAndFolder(
                user,
                folder
        );
    }

    // =========================
    // Delete File
    // =========================

    public void deleteFile(
            Long fileId,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        File file = fileRepository.findById(fileId)
                .orElseThrow(() ->
                        new RuntimeException("File not found"));

        // Only owner can delete
        if (!file.getOwner().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You do not have permission to delete this file"
            );
        }

        // Save information before deleting
        String fileName =
                file.getOriginalName();

        Long deletedFileId =
                file.getId();

        Long folderId =
                file.getFolder() != null
                        ? file.getFolder().getId()
                        : null;

        StoredObject storedObject =
                file.getStoredObject();

        // =========================
        // Delete associated shares
        // =========================

        fileShareRepository.deleteAll(
                fileShareRepository.findByFile(file)
        );

        // =========================
        // Delete associated public link
        // =========================

        publicLinkRepository
                .findByFile(file)
                .ifPresent(publicLinkRepository::delete);

        // =========================
        // Delete File metadata
        // =========================

        fileRepository.delete(file);

        // =========================
        // Handle StoredObject
        // =========================

        Long referenceCount =
                storedObject.getReferenceCount();

        if (referenceCount <= 1) {

            // No other File is using this object
            storageService.deleteFile(
                    storedObject.getStorageKey()
            );

            storedObjectRepository.delete(
                    storedObject
            );

        } else {

            // Other files still use the object
            storedObject.setReferenceCount(
                    referenceCount - 1
            );

            storedObjectRepository.save(
                    storedObject
            );
        }

        // =========================
        // Activity Log
        // =========================

        activityLogService.log(
                user,
                "FILE_DELETED",
                "Deleted file: "
                        + fileName,
                deletedFileId,
                folderId
        );
    }

    // =========================
    // Get File For Download
    // =========================

    public File getFileForDownload(
            Long fileId,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        File file = fileRepository.findById(fileId)
                .orElseThrow(() ->
                        new RuntimeException("File not found"));

        // =========================
        // Owner
        // =========================

        if (file.getOwner().getId().equals(user.getId())) {

            activityLogService.log(
                    user,
                    "FILE_DOWNLOADED",
                    "Downloaded file: "
                            + file.getOriginalName(),
                    file.getId(),
                    file.getFolder() != null
                            ? file.getFolder().getId()
                            : null
            );

            return file;
        }

        // =========================
        // Shared user
        // =========================

        FileShare fileShare =
                fileShareRepository
                        .findByFileAndSharedWith(
                                file,
                                user
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "You do not have permission to download this file"
                                ));

        // VIEW does not allow download
        if (fileShare.getPermission()
                != Permission.DOWNLOAD) {

            throw new RuntimeException(
                    "You only have VIEW permission for this file"
            );
        }

        // Activity log
        activityLogService.log(
                user,
                "FILE_DOWNLOADED",
                "Downloaded file: "
                        + file.getOriginalName(),
                file.getId(),
                file.getFolder() != null
                        ? file.getFolder().getId()
                        : null
        );

        return file;
    }

    // =========================
    // Search Files
    // =========================

    public List<File> searchFiles(
            String query,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (query == null ||
                query.trim().isEmpty()) {

            throw new RuntimeException(
                    "Search query cannot be empty"
            );
        }

        return fileRepository
                .findByOwnerAndOriginalNameContainingIgnoreCase(
                        user,
                        query.trim()
                );
    }

    // =========================
    // Storage Usage
    // =========================

    public StorageUsageResponse getStorageUsage(
            Authentication authentication) {

        userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        long usedBytes =
                storedObjectRepository.sumTotalStorage();

        return new StorageUsageResponse(
                usedBytes
        );
    }

    // =========================
// Get File For Preview
// =========================

    public File getFileForPreview(
            Long fileId,
            Authentication authentication) {

        User user =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        File file =
                fileRepository.findById(fileId)
                        .orElseThrow(() ->
                                new RuntimeException("File not found"));

        // Owner can always preview
        if (file.getOwner().getId().equals(user.getId())) {
            return file;
        }

        // Check whether the file is shared with this user
        FileShare fileShare =
                fileShareRepository
                        .findByFileAndSharedWith(file, user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "You do not have permission to view this file"
                                ));

        // Both VIEW and DOWNLOAD can preview
        if (fileShare.getPermission() != Permission.VIEW
                && fileShare.getPermission() != Permission.DOWNLOAD) {

            throw new RuntimeException(
                    "You do not have permission to view this file"
            );
        }

        activityLogService.log(
                user,
                "FILE_PREVIEWED",
                "Previewed file: " + file.getOriginalName(),
                file.getId(),
                file.getFolder() != null
                        ? file.getFolder().getId()
                        : null
        );

        return file;
    }
}