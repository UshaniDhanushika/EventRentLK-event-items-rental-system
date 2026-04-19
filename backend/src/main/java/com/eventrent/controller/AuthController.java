package com.eventrent.controller;

import com.eventrent.dto.AuthResponse;
import com.eventrent.dto.ChangePasswordRequest;
import com.eventrent.dto.LoginRequest;
import com.eventrent.dto.RegisterRequest;
import com.eventrent.dto.UserProfileResponse;
import com.eventrent.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest body) {
        return authService.register(body);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest body) {
        return authService.login(body);
    }

    @GetMapping("/me")
    public UserProfileResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authService.profileForEmail(authentication.getName());
    }

    @PostMapping("/change-password")
    public void changePassword(Authentication authentication, @jakarta.validation.Valid @RequestBody ChangePasswordRequest body) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED);
        }
        authService.changePassword(authentication.getName(), body);
    }
}
