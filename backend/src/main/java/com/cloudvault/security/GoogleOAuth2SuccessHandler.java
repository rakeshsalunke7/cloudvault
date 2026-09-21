package com.cloudvault.security;

import com.cloudvault.activity.service.ActivityLogService;
import com.cloudvault.user.entity.AuthProvider;
import com.cloudvault.user.entity.Role;
import com.cloudvault.user.entity.User;
import com.cloudvault.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GoogleOAuth2SuccessHandler
        implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final ActivityLogService activityLogService;
    private final OAuthCodeService oauthCodeService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public GoogleOAuth2SuccessHandler(
            UserRepository userRepository,
            JwtService jwtService,
            ActivityLogService activityLogService,
            OAuthCodeService oauthCodeService) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.activityLogService = activityLogService;
        this.oauthCodeService = oauthCodeService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();

        // =========================================================
        // Get Google user information
        // =========================================================

        String googleId =
                oauthUser.getAttribute("sub");

        String email =
                oauthUser.getAttribute("email");

        String name =
                oauthUser.getAttribute("name");

        String profileImage =
                oauthUser.getAttribute("picture");

        if (googleId == null || email == null) {
            throw new RuntimeException(
                    "Unable to retrieve Google account information"
            );
        }

        email = email.trim().toLowerCase();

        // =========================================================
        // Find or create user
        // =========================================================

        User user =
                userRepository.findByGoogleId(googleId)
                        .orElse(null);

        // If Google ID isn't linked yet,
        // check whether the email already exists.
        if (user == null) {

            user =
                    userRepository.findByEmail(email)
                            .orElse(null);
        }

        // =========================================================
        // Existing user
        // =========================================================

        if (user != null) {

            // Link Google account if necessary
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
            }

            user.setProfileImage(profileImage);
            user.setAuthProvider(AuthProvider.GOOGLE);

            userRepository.save(user);
        }

        // =========================================================
        // New Google user
        // =========================================================

        else {

            user = User.builder()
                    .fullName(
                            name != null && !name.isBlank()
                                    ? name
                                    : "Google User"
                    )
                    .email(email)
                    .password(null)
                    .googleId(googleId)
                    .profileImage(profileImage)
                    .authProvider(AuthProvider.GOOGLE)
                    .role(Role.USER)
                    .active(true)
                    .build();

            user = userRepository.save(user);
        }

        // =========================================================
        // Check account status
        // =========================================================

        if (!user.isActive()) {

            throw new RuntimeException(
                    "User account is inactive"
            );
        }

        // =========================================================
        // Generate CloudVault JWT
        // =========================================================

        String token =
                jwtService.generateToken(user.getEmail());

        // =========================================================
        // Activity log
        // =========================================================

        activityLogService.log(
                user,
                "LOGIN",
                "User logged in with Google",
                null,
                null
        );

        // =========================================================
        // Store JWT against a short-lived one-time code
        // =========================================================

        String code =
                oauthCodeService.createCode(token);

        // =========================================================
        // Redirect frontend using ONLY the temporary code
        // =========================================================

        String redirectUrl =
                frontendUrl + "/oauth-success?code=" + code;

        response.sendRedirect(redirectUrl);
    }
}