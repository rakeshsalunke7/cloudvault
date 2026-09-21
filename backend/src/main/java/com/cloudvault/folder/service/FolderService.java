package com.cloudvault.folder.service;

import com.cloudvault.activity.service.ActivityLogService;
import com.cloudvault.folder.dto.CreateFolderRequest;
import com.cloudvault.folder.dto.FolderResponse;
import com.cloudvault.folder.entity.Folder;
import com.cloudvault.folder.repository.FolderRepository;
import com.cloudvault.user.entity.User;
import com.cloudvault.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public FolderService(
            FolderRepository folderRepository,
            UserRepository userRepository,
            ActivityLogService activityLogService) {

        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    public List<FolderResponse> getMyFolders(
            Long parentFolderId,
            Authentication authentication) {

        User user =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        if (parentFolderId == null) {

            return folderRepository
                    .findByOwnerAndParentFolderIsNull(user)
                    .stream()
                    .map(folder -> new FolderResponse(
                            folder.getId(),
                            folder.getName(),
                            null,
                            folder.getCreatedAt()
                    ))
                    .toList();
        }

        Folder parentFolder =
                folderRepository
                        .findById(parentFolderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Parent folder not found"
                                ));

        if (!parentFolder
                .getOwner()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You do not have permission to access this folder"
            );
        }

        return folderRepository
                .findByOwnerAndParentFolder(
                        user,
                        parentFolder
                )
                .stream()
                .map(folder -> new FolderResponse(
                        folder.getId(),
                        folder.getName(),
                        folder.getParentFolder() != null
                                ? folder.getParentFolder().getId()
                                : null,
                        folder.getCreatedAt()
                ))
                .toList();
    }

    public FolderResponse getFolderById(
            Long folderId,
            Authentication authentication) {

        User user =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        Folder folder =
                folderRepository
                        .findById(folderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Folder not found"
                                ));

        if (!folder
                .getOwner()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You do not have permission to access this folder"
            );
        }

        return new FolderResponse(
                folder.getId(),
                folder.getName(),
                folder.getParentFolder() != null
                        ? folder.getParentFolder().getId()
                        : null,
                folder.getCreatedAt()
        );
    }

    public FolderResponse createFolder(
            CreateFolderRequest request,
            Authentication authentication) {

        User user =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        Folder parentFolder = null;

        if (request.getParentFolderId() != null) {

            parentFolder =
                    folderRepository
                            .findById(
                                    request.getParentFolderId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Parent folder not found"
                                    ));

            if (!parentFolder
                    .getOwner()
                    .getId()
                    .equals(user.getId())) {

                throw new RuntimeException(
                        "You do not have permission to use this parent folder"
                );
            }
        }

        Folder folder =
                Folder.builder()
                        .name(request.getName())
                        .owner(user)
                        .parentFolder(parentFolder)
                        .createdAt(LocalDateTime.now())
                        .build();

        Folder savedFolder =
                folderRepository.save(folder);

        activityLogService.log(
                user,
                "FOLDER_CREATED",
                "Created folder: "
                        + savedFolder.getName(),
                null,
                savedFolder.getId()
        );

        return new FolderResponse(
                savedFolder.getId(),
                savedFolder.getName(),
                parentFolder != null
                        ? parentFolder.getId()
                        : null,
                savedFolder.getCreatedAt()
        );
    }
}