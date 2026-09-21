package com.cloudvault.file.controller;

import com.cloudvault.file.dto.FileResponse;
import com.cloudvault.file.dto.StorageUsageResponse;
import com.cloudvault.file.entity.File;
import com.cloudvault.file.service.FileService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.cloudvault.file.dto.StorageUsageResponse;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // =========================
    // Upload File
    // =========================

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) Long folderId,
            Authentication authentication) {

        File uploadedFile =
                fileService.uploadFile(
                        file,
                        folderId,
                        authentication
                );

        FileResponse response = new FileResponse(
                uploadedFile.getId(),
                uploadedFile.getOriginalName(),
                uploadedFile.getContentType(),
                uploadedFile.getSize(),
                uploadedFile.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    // =========================
    // Delete File
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFile(
            @PathVariable Long id,
            Authentication authentication) {

        fileService.deleteFile(
                id,
                authentication
        );

        return ResponseEntity.ok(
                "File deleted successfully"
        );
    }

    // =========================
    // Download File
    // =========================

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable Long id,
            Authentication authentication) {

        File file =
                fileService.getFileForDownload(
                        id,
                        authentication
                );

        byte[] fileData =
                fileService.downloadFileData(file);

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                file.getContentType()
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition
                                .attachment()
                                .filename(file.getOriginalName())
                                .build()
                                .toString()
                )
                .body(fileData);
    }

    // =========================
    // Get My Files
    // =========================

    @GetMapping
    public ResponseEntity<List<FileResponse>> getMyFiles(
            @RequestParam(value = "folderId", required = false)
            Long folderId,
            Authentication authentication) {

        List<File> files =
                fileService.getMyFiles(
                        folderId,
                        authentication
                );

        List<FileResponse> response = files.stream()
                .map(file -> new FileResponse(
                        file.getId(),
                        file.getOriginalName(),
                        file.getContentType(),
                        file.getSize(),
                        file.getCreatedAt()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<FileResponse>> searchFiles(
            @RequestParam String query,
            Authentication authentication) {

        List<File> files =
                fileService.searchFiles(
                        query,
                        authentication
                );

        List<FileResponse> response = files.stream()
                .map(file -> new FileResponse(
                        file.getId(),
                        file.getOriginalName(),
                        file.getContentType(),
                        file.getSize(),
                        file.getCreatedAt()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/storage")
    public ResponseEntity<StorageUsageResponse> getStorageUsage(
            Authentication authentication) {

        return ResponseEntity.ok(
                fileService.getStorageUsage(authentication)
        );
    }

    // =========================
// Preview File
// =========================

    @GetMapping("/{id}/preview")
    public ResponseEntity<byte[]> previewFile(
            @PathVariable Long id,
            Authentication authentication) {

        File file =
                fileService.getFileForPreview(
                        id,
                        authentication
                );

        byte[] fileData =
                fileService.downloadFileData(file);

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                file.getContentType()
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition
                                .inline()
                                .filename(file.getOriginalName())
                                .build()
                                .toString()
                )
                .body(fileData);
    }

}