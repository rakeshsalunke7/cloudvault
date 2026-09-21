package com.cloudvault.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StorageUsageResponse {

    private long usedBytes;
}