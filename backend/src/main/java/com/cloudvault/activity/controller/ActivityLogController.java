package com.cloudvault.activity.controller;

import com.cloudvault.activity.dto.ActivityLogResponse;
import com.cloudvault.activity.entity.ActivityLog;
import com.cloudvault.activity.service.ActivityLogService;
import com.cloudvault.user.entity.User;
import com.cloudvault.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityLogController {

    private final ActivityLogService activityLogService;
    private final UserRepository userRepository;

    public ActivityLogController(
            ActivityLogService activityLogService,
            UserRepository userRepository) {

        this.activityLogService = activityLogService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLogResponse>> getMyActivity(
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ActivityLog> logs =
                activityLogService.getUserActivity(user);

        List<ActivityLogResponse> response = logs.stream()
                .map(log -> new ActivityLogResponse(
                        log.getId(),
                        log.getAction(),
                        log.getDescription(),
                        log.getFileId(),
                        log.getFolderId(),
                        log.getCreatedAt()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }
}