package com.cloudvault.file.repository;

import com.cloudvault.file.entity.StoredObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface StoredObjectRepository
        extends JpaRepository<StoredObject, Long> {

    Optional<StoredObject> findByFileHash(String fileHash);

    @Query("SELECT COALESCE(SUM(s.size), 0) FROM StoredObject s")
    long sumTotalStorage();
}