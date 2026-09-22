package com.cloudvault.sharing.service;

import com.cloudvault.activity.service.ActivityLogService;
import com.cloudvault.file.entity.File;
import com.cloudvault.file.repository.FileRepository;
import com.cloudvault.sharing.dto.InvitationResponse;
import com.cloudvault.sharing.dto.PublicLinkResponse;
import com.cloudvault.sharing.dto.ShareFileRequest;
import com.cloudvault.sharing.dto.ShareResponse;
import com.cloudvault.sharing.entity.FileShare;
import com.cloudvault.sharing.entity.PublicLink;
import com.cloudvault.sharing.entity.ShareStatus;
import com.cloudvault.sharing.repository.FileShareRepository;
import com.cloudvault.sharing.repository.PublicLinkRepository;
import com.cloudvault.user.entity.User;
import com.cloudvault.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SharingService {

    private final FileShareRepository fileShareRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final PublicLinkRepository publicLinkRepository;
    private final ActivityLogService activityLogService;

    public SharingService(
            FileShareRepository fileShareRepository,
            FileRepository fileRepository,
            UserRepository userRepository,
            PublicLinkRepository publicLinkRepository,
            ActivityLogService activityLogService) {

        this.fileShareRepository = fileShareRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.publicLinkRepository = publicLinkRepository;
        this.activityLogService = activityLogService;
    }

    // =========================================================
    // PRIVATE FILE SHARING
    // =========================================================

    public ShareResponse shareFile(
            ShareFileRequest request,
            Authentication authentication) {

        User owner =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        File file =
                fileRepository.findById(request.getFileId())
                        .orElseThrow(() ->
                                new RuntimeException("File not found"));

        // Only the file owner can share the file
        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException(
                    "You do not have permission to share this file"
            );
        }

        String recipientEmail =
                request.getSharedWithEmail()
                        .trim()
                        .toLowerCase();

        // Prevent sharing with yourself
        if (recipientEmail.equals(
                owner.getEmail().toLowerCase())) {

            throw new RuntimeException(
                    "You cannot share a file with yourself"
            );
        }

        // Prevent duplicate share/invitation
        if (fileShareRepository
                .findByFileAndSharedWithEmail(
                        file,
                        recipientEmail
                )
                .isPresent()) {

            throw new RuntimeException(
                    "File is already shared with this email"
            );
        }

        // Check whether recipient already has a CloudVault account
        User recipient =
                userRepository.findByEmail(recipientEmail)
                        .orElse(null);

        /*
         * Existing user:
         *      sharedWith = recipient
         *      status = ACCEPTED
         *      no invitation token
         *
         * New user:
         *      sharedWith = null
         *      status = PENDING
         *      invitation token generated
         *      invitation expires in 7 days
         */

        String invitationToken =
                recipient == null
                        ? UUID.randomUUID().toString()
                        : null;

        LocalDateTime invitationExpiresAt =
                recipient == null
                        ? LocalDateTime.now().plusDays(7)
                        : null;

        ShareStatus status =
                recipient != null
                        ? ShareStatus.ACCEPTED
                        : ShareStatus.PENDING;

        FileShare fileShare =
                FileShare.builder()
                        .file(file)
                        .sharedWith(recipient)
                        .sharedWithEmail(recipientEmail)
                        .permission(request.getPermission())
                        .status(status)
                        .invitationToken(invitationToken)
                        .invitationExpiresAt(invitationExpiresAt)
                        .createdAt(LocalDateTime.now())
                        .build();

        FileShare savedShare =
                fileShareRepository.save(fileShare);

        // Activity log
        activityLogService.log(
                owner,
                "FILE_SHARED",
                "Shared file: "
                        + file.getOriginalName()
                        + " with "
                        + recipientEmail
                        + " ("
                        + savedShare.getPermission().name()
                        + ")",
                file.getId(),
                file.getFolder() != null
                        ? file.getFolder().getId()
                        : null
        );

        /*
         * IMPORTANT:
         *
         * invitationToken is returned only when the recipient
         * does not already have an account.
         *
         * The frontend can then construct:
         *
         * http://localhost:5173/invite/{token}
         *
         * In production the frontend will use its real domain.
         */

        return new ShareResponse(
                savedShare.getId(),
                file.getId(),
                file.getOriginalName(),
                owner.getEmail(),
                recipientEmail,
                savedShare.getPermission(),
                savedShare.getCreatedAt(),
                savedShare.getStatus(),
                savedShare.getInvitationToken(),
                savedShare.getInvitationExpiresAt()
        );
    }

    // =========================================================
    // PUBLIC LINKS
    // =========================================================

    public PublicLinkResponse createPublicLink(
            Long fileId,
            Authentication authentication) {

        User owner =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        File file =
                fileRepository.findById(fileId)
                        .orElseThrow(() ->
                                new RuntimeException("File not found"));

        // Only owner can create public link
        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException(
                    "You do not have permission to create a public link for this file"
            );
        }

        // Prevent multiple active links
        if (publicLinkRepository
                .findByFileAndActiveTrue(file)
                .isPresent()) {

            throw new RuntimeException(
                    "A public link already exists for this file"
            );
        }

        String token =
                UUID.randomUUID().toString();

        /*
         * The database allows only one public-link record
         * per file. If a previous link was revoked, reuse
         * that record with a new token.
         *
         * This invalidates the old public URL while allowing
         * the file to receive a new public URL.
         */
        PublicLink publicLink =
                publicLinkRepository
                        .findByFile(file)
                        .orElseGet(() ->
                                PublicLink.builder()
                                        .file(file)
                                        .build()
                        );

        publicLink.setToken(token);
        publicLink.setCreatedAt(LocalDateTime.now());
        publicLink.setExpiresAt(null);
        publicLink.setActive(true);

        PublicLink savedLink =
                publicLinkRepository.save(publicLink);

        activityLogService.log(
                owner,
                "PUBLIC_LINK_CREATED",
                "Created public link for file: "
                        + file.getOriginalName(),
                file.getId(),
                file.getFolder() != null
                        ? file.getFolder().getId()
                        : null
        );

        return new PublicLinkResponse(
                savedLink.getId(),
                file.getId(),
                file.getOriginalName(),
                savedLink.getToken(),
                savedLink.getCreatedAt(),
                savedLink.getExpiresAt(),
                savedLink.isActive()
        );
    }

    // =========================================================
    // SHARED WITH ME
    // =========================================================

    public List<ShareResponse> getSharedWithMe(
            Authentication authentication) {

        User user =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        return fileShareRepository
                .findBySharedWith(user)
                .stream()
                .map(share ->
                        new ShareResponse(
                                share.getId(),
                                share.getFile().getId(),
                                share.getFile().getOriginalName(),
                                share.getFile().getOwner().getEmail(),
                                user.getEmail(),
                                share.getPermission(),
                                share.getCreatedAt(),
                                share.getStatus(),
                                null,
                                null
                        )
                )
                .toList();
    }

    // =========================================================
    // REVOKE PRIVATE SHARE
    // =========================================================

    public void revokeShare(
            Long shareId,
            Authentication authentication) {

        User owner =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        FileShare fileShare =
                fileShareRepository.findById(shareId)
                        .orElseThrow(() ->
                                new RuntimeException("Share not found"));

        File file =
                fileShare.getFile();

        // Only owner can revoke
        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException(
                    "You do not have permission to revoke this share"
            );
        }

        String fileName =
                file.getOriginalName();

        String sharedUserEmail =
                fileShare.getSharedWithEmail();

        Long fileId =
                file.getId();

        Long folderId =
                file.getFolder() != null
                        ? file.getFolder().getId()
                        : null;

        fileShareRepository.delete(fileShare);

        activityLogService.log(
                owner,
                "SHARE_REVOKED",
                "Revoked access to file: "
                        + fileName
                        + " from "
                        + sharedUserEmail,
                fileId,
                folderId
        );
    }

    // =========================================================
    // PUBLIC FILE ACCESS
    // =========================================================

    public File getFileFromPublicLink(
            String token) {

        PublicLink publicLink =
                publicLinkRepository
                        .findByToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Public link not found"
                                ));

        if (!publicLink.isActive()) {
            throw new RuntimeException(
                    "Public link is inactive"
            );
        }

        if (publicLink.getExpiresAt() != null
                && publicLink.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Public link has expired"
            );
        }

        return publicLink.getFile();
    }

    // =========================================================
    // REVOKE PUBLIC LINK
    // =========================================================

    public void revokePublicLink(
            Long publicLinkId,
            Authentication authentication) {

        User owner =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        PublicLink publicLink =
                publicLinkRepository
                        .findById(publicLinkId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Public link not found"
                                ));

        File file =
                publicLink.getFile();

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException(
                    "You do not have permission to revoke this public link"
            );
        }

        publicLink.setActive(false);

        publicLinkRepository.save(publicLink);

        activityLogService.log(
                owner,
                "PUBLIC_LINK_REVOKED",
                "Revoked public link for file: "
                        + file.getOriginalName(),
                file.getId(),
                file.getFolder() != null
                        ? file.getFolder().getId()
                        : null
        );
    }

    // =========================================================
    // INVITATIONS
    // =========================================================

    public InvitationResponse getInvitation(
            String token) {

        FileShare share =
                fileShareRepository
                        .findByInvitationToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invitation not found"
                                ));

        if (share.getStatus()
                != ShareStatus.PENDING) {

            throw new RuntimeException(
                    "This invitation has already been accepted"
            );
        }

        if (share.getInvitationExpiresAt() != null
                && share.getInvitationExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "This invitation has expired"
            );
        }

        File file =
                share.getFile();

        return new InvitationResponse(
                share.getId(),
                file.getId(),
                file.getOriginalName(),
                file.getOwner().getEmail(),
                share.getSharedWithEmail(),
                share.getPermission(),
                share.getInvitationExpiresAt()
        );
    }

    // =========================================================
    // ACCEPT INVITATION
    // =========================================================

    public ShareResponse acceptInvitation(
            String token,
            Authentication authentication) {

        User user =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        FileShare share =
                fileShareRepository
                        .findByInvitationToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invitation not found"
                                ));

        if (share.getStatus()
                != ShareStatus.PENDING) {

            throw new RuntimeException(
                    "This invitation has already been accepted"
            );
        }

        if (share.getInvitationExpiresAt() != null
                && share.getInvitationExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "This invitation has expired"
            );
        }

        if (!user.getEmail()
                .equalsIgnoreCase(
                        share.getSharedWithEmail()
                )) {

            throw new RuntimeException(
                    "This invitation was sent to "
                            + share.getSharedWithEmail()
                            + ". Please log in with that account."
            );
        }

        share.setSharedWith(user);

        share.setStatus(
                ShareStatus.ACCEPTED
        );

        // Token becomes invalid after acceptance
        share.setInvitationToken(null);
        share.setInvitationExpiresAt(null);

        FileShare savedShare =
                fileShareRepository.save(share);

        activityLogService.log(
                user,
                "FILE_SHARE_ACCEPTED",
                "Accepted invitation for file: "
                        + share.getFile().getOriginalName(),
                share.getFile().getId(),
                share.getFile().getFolder() != null
                        ? share.getFile().getFolder().getId()
                        : null
        );

        return new ShareResponse(
                savedShare.getId(),
                savedShare.getFile().getId(),
                savedShare.getFile().getOriginalName(),
                savedShare.getFile().getOwner().getEmail(),
                savedShare.getSharedWithEmail(),
                savedShare.getPermission(),
                savedShare.getCreatedAt(),
                savedShare.getStatus(),
                null,
                null
        );
    }

    // =========================================================
    // GET ACTIVE PUBLIC LINK
    // =========================================================

    public PublicLinkResponse getActivePublicLink(
            Long fileId,
            Authentication authentication) {

        User owner =
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        File file =
                fileRepository.findById(fileId)
                        .orElseThrow(() ->
                                new RuntimeException("File not found"));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException(
                    "You do not have permission to access the public link for this file"
            );
        }

        PublicLink publicLink =
                publicLinkRepository
                        .findByFileAndActiveTrue(file)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No active public link"
                                ));

        return new PublicLinkResponse(
                publicLink.getId(),
                file.getId(),
                file.getOriginalName(),
                publicLink.getToken(),
                publicLink.getCreatedAt(),
                publicLink.getExpiresAt(),
                publicLink.isActive()
        );
    }
}