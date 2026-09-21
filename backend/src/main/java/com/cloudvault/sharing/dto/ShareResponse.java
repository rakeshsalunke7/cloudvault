package com.cloudvault.sharing.dto;

import com.cloudvault.sharing.entity.Permission;
import com.cloudvault.sharing.entity.ShareStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ShareResponse {

    private Long id;

    private Long fileId;

    private String fileName;

    private String sharedByEmail;

    private String sharedWithEmail;

    private Permission permission;

    private LocalDateTime createdAt;

    // Invitation information
    private ShareStatus status;

    private String invitationToken;

    private LocalDateTime invitationExpiresAt;
}