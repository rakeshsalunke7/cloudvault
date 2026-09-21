package com.cloudvault.security;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/oauth")
public class OAuthController {

    private final OAuthCodeService oauthCodeService;

    public OAuthController(
            OAuthCodeService oauthCodeService) {

        this.oauthCodeService = oauthCodeService;
    }

    @PostMapping("/exchange")
    public ResponseEntity<OAuthExchangeResponse> exchangeCode(
            @RequestBody OAuthExchangeRequest request) {

        String token =
                oauthCodeService.exchangeCode(
                        request.code()
                );

        return ResponseEntity.ok(
                new OAuthExchangeResponse(token)
        );
    }

    public record OAuthExchangeRequest(
            String code
    ) {
    }

    public record OAuthExchangeResponse(
            String token
    ) {
    }
}