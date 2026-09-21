package com.cloudvault.file.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.io.IOException;

@Service
public class StorageService {

    private final S3Client s3Client;

    @Value("${b2.bucket-name}")
    private String bucketName;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public void uploadFile(
            String storageKey,
            MultipartFile file) {

        try {
            PutObjectRequest request =
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(storageKey)
                            .contentType(file.getContentType())
                            .build();

            s3Client.putObject(
                    request,
                    RequestBody.fromBytes(file.getBytes())
            );

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to upload file",
                    e
            );
        }
    }

    public void deleteFile(String storageKey) {

        try {
            DeleteObjectRequest request =
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(storageKey)
                            .build();

            s3Client.deleteObject(request);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to delete file from storage",
                    e
            );
        }
    }

    public byte[] downloadFile(String storageKey) {

        try {
            GetObjectRequest request =
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(storageKey)
                            .build();

            return s3Client.getObjectAsBytes(request).asByteArray();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to download file",
                    e
            );
        }
    }
}