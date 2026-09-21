package com.cloudvault.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthCodeService {

    private static final long CODE_EXPIRATION_SECONDS = 120;

    private final Map<String, OAuthCodeEntry> codes =
            new ConcurrentHashMap<>();

    /**
     * Creates a short-lived, one-time OAuth code
     * associated with the actual CloudVault JWT.
     */
    public String createCode(String token) {

        cleanupExpiredCodes();

        String code =
                UUID.randomUUID().toString();

        Instant expiresAt =
                Instant.now()
                        .plusSeconds(CODE_EXPIRATION_SECONDS);

        codes.put(
                code,
                new OAuthCodeEntry(
                        token,
                        expiresAt
                )
        );

        return code;
    }

    /**
     * Exchanges a one-time OAuth code for the
     * CloudVault JWT.
     *
     * The code is removed immediately, making it
     * single-use.
     */
    public String exchangeCode(String code) {

        if (code == null || code.isBlank()) {
            throw new RuntimeException(
                    "OAuth code is required"
            );
        }

        OAuthCodeEntry entry =
                codes.remove(code);

        if (entry == null) {
            throw new RuntimeException(
                    "Invalid or already used OAuth code"
            );
        }

        if (entry.expiresAt()
                .isBefore(Instant.now())) {

            throw new RuntimeException(
                    "OAuth code has expired"
            );
        }

        return entry.token();
    }

    private void cleanupExpiredCodes() {

        Instant now = Instant.now();

        codes.entrySet().removeIf(
                entry ->
                        entry.getValue()
                                .expiresAt()
                                .isBefore(now)
        );
    }

    private record OAuthCodeEntry(
            String token,
            Instant expiresAt
    ) {
    }
}