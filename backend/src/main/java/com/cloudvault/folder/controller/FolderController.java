package com.cloudvault.folder.controller;

import com.cloudvault.folder.dto.CreateFolderRequest;
import com.cloudvault.folder.dto.FolderResponse;
import com.cloudvault.folder.service.FolderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(
            FolderService folderService) {

        this.folderService = folderService;
    }

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(
            @Valid @RequestBody CreateFolderRequest request,
            Authentication authentication) {

        FolderResponse response =
                folderService.createFolder(
                        request,
                        authentication
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<FolderResponse>> getMyFolders(
            @RequestParam(
                    value = "parentFolderId",
                    required = false
            ) Long parentFolderId,
            Authentication authentication) {

        return ResponseEntity.ok(
                folderService.getMyFolders(
                        parentFolderId,
                        authentication
                )
        );
    }

    @GetMapping("/{folderId}")
    public ResponseEntity<FolderResponse> getFolderById(
            @PathVariable Long folderId,
            Authentication authentication) {

        return ResponseEntity.ok(
                folderService.getFolderById(
                        folderId,
                        authentication
                )
        );
    }
}