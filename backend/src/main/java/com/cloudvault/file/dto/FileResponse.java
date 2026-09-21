package com.cloudvault.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class FileResponse {

    private Long id;
    private String originalName;
    private String contentType;
    private Long size;
    private LocalDateTime createdAt;
}