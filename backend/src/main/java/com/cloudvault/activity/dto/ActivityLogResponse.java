package com.cloudvault.activity.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ActivityLogResponse {

    private Long id;
    private String action;
    private String description;
    private Long fileId;
    private Long folderId;
    private LocalDateTime createdAt;
}