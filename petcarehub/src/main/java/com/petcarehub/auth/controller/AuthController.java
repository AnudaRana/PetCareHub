package com.petcarehub.auth.controller;

import com.petcarehub.auth.dto.LoginRequest;
import com.petcarehub.auth.dto.LoginResponse;
import com.petcarehub.auth.dto.RegisterRequest;
import com.petcarehub.security.JwtUtil;
import com.petcarehub.user.dto.UpdateProfileRequest;
import com.petcarehub.user.dto.UserProfileResponse;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import com.petcarehub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        User savedUser = userService.register(request);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userService.getUserByEmail(request.getEmail());
        String token = jwtUtil.generateToken(user);

        String fullName = user.getFirstName() + " " + user.getLastName();
        List<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), fullName, roles));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.updateUserProfile(email, request));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(Authentication auth) {
        Map<String, Object> response = Map.of(
                "valid", auth != null && auth.isAuthenticated(),
                "email", auth != null ? auth.getName() : null,
                "authorities", auth != null ? auth.getAuthorities() : null
        );
        return ResponseEntity.ok(response);
    }

    // Admin endpoints
    @GetMapping("/admin/users")
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/admin/users/{userId}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        User user = userService.getUserByEmail(email);
        if (user == null) throw new RuntimeException("User not found");
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(System.currentTimeMillis() + 3600000); // 1 hour
        userRepository.save(user);

        // TODO: actually send email here once JavaMailSender is wired up (2026.03.02)
        return ResponseEntity.ok("Reset email sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestBody Map<String, String> body) {
        String password = body.get("password");
        User user = userRepository.findByResetToken(token).orElseThrow(() -> new RuntimeException("Invalid token"));
        if (user.getResetTokenExpiry() < System.currentTimeMillis()) throw new RuntimeException("Token expired");
        user.setPassword(passwordEncoder.encode(password));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        return ResponseEntity.ok("Password reset");
    }
}