package com.cloudvault.activity.repository;

import com.cloudvault.activity.entity.ActivityLog;
import com.cloudvault.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUserOrderByCreatedAtDesc(User user);
}