package com.cloudvault.activity.service;

import com.cloudvault.activity.entity.ActivityLog;
import com.cloudvault.activity.repository.ActivityLogRepository;
import com.cloudvault.user.entity.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(
            ActivityLogRepository activityLogRepository) {

        this.activityLogRepository = activityLogRepository;
    }

    public void log(
            User user,
            String action,
            String description,
            Long fileId,
            Long folderId) {

        ActivityLog activityLog = ActivityLog.builder()
                .user(user)
                .action(action)
                .description(description)
                .fileId(fileId)
                .folderId(folderId)
                .createdAt(LocalDateTime.now())
                .build();

        activityLogRepository.save(activityLog);
    }

    public List<ActivityLog> getUserActivity(User user) {

        return activityLogRepository
                .findByUserOrderByCreatedAtDesc(user);
    }
}