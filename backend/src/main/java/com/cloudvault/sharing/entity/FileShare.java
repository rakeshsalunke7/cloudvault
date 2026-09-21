package com.cloudvault.sharing.entity;

import com.cloudvault.file.entity.File;
import com.cloudvault.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_shares")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private File file;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_id")
    private User sharedWith;

    @Column(nullable = false)
    private String sharedWithEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Permission permission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShareStatus status;

    @Column(unique = true)
    private String invitationToken;

    private LocalDateTime invitationExpiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}