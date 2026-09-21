package com.cloudvault.config;

import com.cloudvault.security.CustomUserDetailsService;
import com.cloudvault.security.GoogleOAuth2SuccessHandler;
import com.cloudvault.security.JwtAuthenticationFilter;
import com.cloudvault.security.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler)
            throws Exception {

        http
                // JWT-based API authentication does not require CSRF
                .csrf(csrf -> csrf.disable())

                // Enable CORS using CorsConfig
                .cors(cors -> {})

                .authorizeHttpRequests(auth -> auth

                        // =================================================
                        // PUBLIC AUTHENTICATION
                        // =================================================

                        .requestMatchers(
                                "/api/auth/**"
                        )
                        .permitAll()

                        // =================================================
                        // PUBLIC FILE ACCESS
                        // =================================================
                        // Only GET access to a public token is public.
                        // Creating/revoking a public link remains protected.

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/shares/public/**"
                        )
                        .permitAll()

                        // =================================================
                        // PUBLIC INVITATION DETAILS
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/shares/invite/**"
                        )
                        .permitAll()

                        // =================================================
                        // GOOGLE OAUTH
                        // =================================================

                        .requestMatchers(
                                "/oauth2/**",
                                "/login/oauth2/**"
                        )
                        .permitAll()

                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest()
                        .authenticated()
                )

                /*
                 * OAuth2 login needs session support during the
                 * authentication flow. JWT-protected API requests
                 * still use the JwtAuthenticationFilter below.
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.IF_REQUIRED
                        )
                )

                .oauth2Login(oauth ->
                        oauth.successHandler(
                                googleOAuth2SuccessHandler
                        )
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        return new JwtAuthenticationFilter(
                jwtService,
                userDetailsService
        );
    }
}