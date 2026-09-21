package com.cloudvault.auth.service;

import com.cloudvault.activity.service.ActivityLogService;
import com.cloudvault.auth.dto.AuthResponse;
import com.cloudvault.auth.dto.LoginRequest;
import com.cloudvault.auth.dto.RegisterRequest;
import com.cloudvault.security.JwtService;
import com.cloudvault.user.entity.AuthProvider;
import com.cloudvault.user.entity.Role;
import com.cloudvault.user.entity.User;
import com.cloudvault.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ActivityLogService activityLogService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ActivityLogService activityLogService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.activityLogService = activityLogService;
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        if (!user.isActive()) {
            throw new RuntimeException(
                    "User account is inactive"
            );
        }

        String token =
                jwtService.generateToken(user.getEmail());

        // Activity log
        activityLogService.log(
                user,
                "LOGIN",
                "User logged in successfully",
                null,
                null
        );

        return new AuthResponse(
                token,
                "Login successful"
        );
    }

    public void register(RegisterRequest request) {

        // 1. Check whether email already exists
        if (userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        // 2. Create a new User
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .authProvider(AuthProvider.LOCAL)
                .role(Role.USER)
                .active(true)
                .build();

        // 3. Save user
        User savedUser =
                userRepository.save(user);

        // 4. Activity log
        activityLogService.log(
                savedUser,
                "USER_REGISTERED",
                "User account registered",
                null,
                null
        );
    }
}