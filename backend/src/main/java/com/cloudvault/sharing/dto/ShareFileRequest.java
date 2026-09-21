package com.cloudvault.sharing.dto;

import com.cloudvault.sharing.entity.Permission;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShareFileRequest {

    @NotNull(message = "File ID is required")
    private Long fileId;

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String sharedWithEmail;

    @NotNull(message = "Permission is required")
    private Permission permission;
}