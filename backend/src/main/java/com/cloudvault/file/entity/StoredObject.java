package com.cloudvault.file.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "stored_objects",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"file_hash"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoredObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String fileHash;

    @Column(nullable = false, unique = true)
    private String storageKey;

    @Column(nullable = false)
    private Long size;

    @Column(nullable = false)
    private Long referenceCount;
}