package com.cloudvault.sharing.repository;

import com.cloudvault.file.entity.File;
import com.cloudvault.sharing.entity.PublicLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublicLinkRepository
        extends JpaRepository<PublicLink, Long> {

    // Find any public link associated with a file.
    // Used by existing FileService logic.
    Optional<PublicLink> findByFile(File file);

    // Find only an ACTIVE public link associated with a file.
    // Used when creating a new public link.
    Optional<PublicLink> findByFileAndActiveTrue(File file);

    // Find a public link using its token.
    Optional<PublicLink> findByToken(String token);
}