package com.cloudvault.sharing.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PublicLinkResponse {

    private Long id;
    private Long fileId;
    private String fileName;
    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean active;
}