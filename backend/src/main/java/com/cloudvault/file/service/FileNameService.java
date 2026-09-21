package com.cloudvault.file.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileNameService {

    public String getSafeFileName(MultipartFile file) {

        String originalName = file.getOriginalFilename();

        if (originalName == null ||
                originalName.trim().isEmpty()) {

            throw new RuntimeException(
                    "File name cannot be empty"
            );
        }

        // Remove path information
        String fileName = originalName
                .replace("\\", "/");

        int lastSlash = fileName.lastIndexOf("/");

        if (lastSlash >= 0) {
            fileName = fileName.substring(lastSlash + 1);
        }

        fileName = fileName.trim();

        if (fileName.isEmpty()) {
            throw new RuntimeException(
                    "Invalid file name"
            );
        }

        // Prevent special path names
        if (fileName.equals(".") ||
                fileName.equals("..")) {

            throw new RuntimeException(
                    "Invalid file name"
            );
        }

        // Limit filename length
        if (fileName.length() > 255) {

            throw new RuntimeException(
                    "File name cannot exceed 255 characters"
            );
        }

        return fileName;
    }
}