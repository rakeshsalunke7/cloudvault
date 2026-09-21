package com.cloudvault.file.repository;

import com.cloudvault.file.entity.File;
import com.cloudvault.folder.entity.Folder;
import com.cloudvault.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.Optional;
import java.util.List;

public interface FileRepository extends JpaRepository<File, Long> {

    List<File> findByOwner(User owner);

    List<File> findByOwnerAndFolder(User owner, Folder folder);

    List<File> findByOwnerAndFolderIsNull(User owner);

    List<File> findByOwnerAndOriginalNameContainingIgnoreCase(
            User owner,
            String name
    );

    @Query("SELECT COALESCE(SUM(f.size), 0) FROM File f WHERE f.owner = :owner")
    long sumSizeByOwner(@Param("owner") User owner);

}