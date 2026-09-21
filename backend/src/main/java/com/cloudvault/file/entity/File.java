package com.cloudvault.file.entity;

import com.cloudvault.folder.entity.Folder;
import com.cloudvault.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import com.cloudvault.folder.entity.Folder;
import java.time.LocalDateTime;

@Entity
@Table(name = "files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class File {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalName;

//    @Column(nullable = false, unique = true)
//    private String storageKey;

    private String contentType;

    @Column(nullable = false)
    private Long size;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stored_object_id", nullable = false)
    private StoredObject storedObject;
}