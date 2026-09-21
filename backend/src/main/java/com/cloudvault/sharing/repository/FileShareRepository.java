package com.cloudvault.sharing.repository;

import com.cloudvault.file.entity.File;
import com.cloudvault.sharing.entity.FileShare;
import com.cloudvault.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileShareRepository
        extends JpaRepository<FileShare, Long> {

    Optional<FileShare> findByFileAndSharedWith(
            File file,
            User sharedWith
    );

    Optional<FileShare> findByFileAndSharedWithEmail(
            File file,
            String sharedWithEmail
    );

    Optional<FileShare> findByInvitationToken(
            String invitationToken
    );

    List<FileShare> findBySharedWith(User user);

    List<FileShare> findBySharedWithEmail(String email);

    List<FileShare> findByFile(File file);
}