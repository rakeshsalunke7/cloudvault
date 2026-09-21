package com.cloudvault.sharing.dto;

import com.cloudvault.sharing.entity.Permission;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class InvitationResponse {

    private Long shareId;

    private Long fileId;

    private String fileName;

    private String ownerEmail;

    private String recipientEmail;

    private Permission permission;

    private LocalDateTime expiresAt;
}