package com.eventrent.service;

import com.eventrent.dto.AuthResponse;
import com.eventrent.dto.ChangePasswordRequest;
import com.eventrent.dto.LoginRequest;
import com.eventrent.dto.RegisterRequest;
import com.eventrent.dto.UserProfileResponse;
import com.eventrent.model.Role;
import com.eventrent.model.UserAccount;
import com.eventrent.repository.UserAccountRepository;
import com.eventrent.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class AuthService {

    private final UserAccountRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserAccountRepository users,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        UserAccount u = new UserAccount();
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setFullName(req.getFullName().trim());
        u.setAddress(req.getAddress().trim());
        u.setPhoneNumber(req.getPhoneNumber().trim());
        u.setRole(Role.USER);
        u.setCreatedAt(Instant.now());
        users.save(u);
        String token = jwtService.generateToken(u);
        return new AuthResponse(token, u.getEmail(), u.getFullName(), u.getRole());
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        UserAccount u = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        String token = jwtService.generateToken(u);
        return new AuthResponse(token, u.getEmail(), u.getFullName(), u.getRole());
    }

    public UserProfileResponse profileForEmail(String email) {
        UserAccount u = users.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return new UserProfileResponse(u.getEmail(), u.getFullName(), u.getAddress(), u.getPhoneNumber(), u.getRole());
    }

    public void changePassword(String email, ChangePasswordRequest req) {
        UserAccount u = users.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(req.getOldPassword(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect current password");
        }

        u.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        users.save(u);
    }

    public void updateProfile(String email, com.eventrent.dto.UpdateProfileRequest req) {
        UserAccount u = users.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (req.getFullName() != null) u.setFullName(req.getFullName().trim());
        if (req.getAddress() != null) u.setAddress(req.getAddress().trim());
        if (req.getPhoneNumber() != null) u.setPhoneNumber(req.getPhoneNumber().trim());

        users.save(u);
    }
}
