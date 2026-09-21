package com.cloudvault.folder.repository;

import com.cloudvault.folder.entity.Folder;
import com.cloudvault.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findByOwner(User owner);

    List<Folder> findByOwnerAndParentFolder(User owner, Folder parentFolder);

    List<Folder> findByOwnerAndParentFolderIsNull(User owner);
}