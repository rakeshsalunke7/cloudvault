package com.cloudvault.sharing.controller;

import com.cloudvault.file.entity.File;
import com.cloudvault.file.service.FileService;
import com.cloudvault.sharing.dto.InvitationResponse;
import com.cloudvault.sharing.dto.PublicLinkResponse;
import com.cloudvault.sharing.dto.ShareFileRequest;
import com.cloudvault.sharing.dto.ShareResponse;
import com.cloudvault.sharing.service.SharingService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shares")
public class SharingController {

    private final SharingService sharingService;
    private final FileService fileService;

    public SharingController(
            SharingService sharingService,
            FileService fileService) {

        this.sharingService = sharingService;
        this.fileService = fileService;
    }

    // =========================================================
    // PRIVATE FILE SHARING
    // =========================================================

    @PostMapping
    public ResponseEntity<ShareResponse> shareFile(
            @Valid @RequestBody ShareFileRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                sharingService.shareFile(
                        request,
                        authentication
                )
        );
    }

    // Get files shared with the logged-in user
    @GetMapping("/shared-with-me")
    public ResponseEntity<List<ShareResponse>> getSharedWithMe(
            Authentication authentication) {

        return ResponseEntity.ok(
                sharingService.getSharedWithMe(
                        authentication
                )
        );
    }

    // Revoke a private file share
    @DeleteMapping("/{shareId}")
    public ResponseEntity<String> revokeShare(
            @PathVariable Long shareId,
            Authentication authentication) {

        sharingService.revokeShare(
                shareId,
                authentication
        );

        return ResponseEntity.ok(
                "File share revoked successfully"
        );
    }

    // =========================================================
    // PUBLIC LINKS
    // =========================================================

    // Create a public link
    @PostMapping("/public")
    public ResponseEntity<PublicLinkResponse> createPublicLink(
            @RequestParam Long fileId,
            Authentication authentication) {

        return ResponseEntity.ok(
                sharingService.createPublicLink(
                        fileId,
                        authentication
                )
        );
    }

    // Get the currently active public link
    @GetMapping("/public")
    public ResponseEntity<PublicLinkResponse> getActivePublicLink(
            @RequestParam Long fileId,
            Authentication authentication) {

        return ResponseEntity.ok(
                sharingService.getActivePublicLink(
                        fileId,
                        authentication
                )
        );
    }

    // Access a file through a public link
    @GetMapping("/public/{token}")
    public ResponseEntity<byte[]> accessPublicFile(
            @PathVariable String token) {

        File file =
                sharingService.getFileFromPublicLink(token);

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
                                .filename(
                                        file.getOriginalName()
                                )
                                .build()
                                .toString()
                )
                .body(fileData);
    }

    // Revoke a public link
    @DeleteMapping("/public/{id}")
    public ResponseEntity<String> revokePublicLink(
            @PathVariable Long id,
            Authentication authentication) {

        sharingService.revokePublicLink(
                id,
                authentication
        );

        return ResponseEntity.ok(
                "Public link revoked successfully"
        );
    }

    // =========================================================
    // INVITATIONS
    // =========================================================

    // Public endpoint used to display invitation details
    @GetMapping("/invite/{token}")
    public ResponseEntity<InvitationResponse> getInvitation(
            @PathVariable String token) {

        return ResponseEntity.ok(
                sharingService.getInvitation(token)
        );
    }

    // Accept an invitation
    @PostMapping("/invite/{token}/accept")
    public ResponseEntity<ShareResponse> acceptInvitation(
            @PathVariable String token,
            Authentication authentication) {

        return ResponseEntity.ok(
                sharingService.acceptInvitation(
                        token,
                        authentication
                )
        );
    }
}