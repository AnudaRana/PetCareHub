package com.petcarehub.auth.controller;

import com.petcarehub.auth.dto.LoginRequest;
import com.petcarehub.auth.dto.LoginResponse;
import com.petcarehub.auth.dto.RegisterRequest;
import com.petcarehub.security.JwtUtil;
import com.petcarehub.user.dto.UserResponse;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import com.petcarehub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.List;
import java.util.stream.Collectors;
import com.petcarehub.user.dto.UserProfileResponse;
import com.petcarehub.appointment.service.AppointmentEmailService;
import com.petcarehub.auth.dto.MailBody;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Random;
import java.util.Date;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import com.petcarehub.auth.repository.ForgotPasswordRepository;
import com.petcarehub.auth.entity.ForgotPassword;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ForgotPasswordRepository forgotPasswordRepository;
    private final AppointmentEmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        User user = userService.getUserByEmail(request.getEmail());
        String token = jwtUtil.generateToken(user);

        List<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new LoginResponse(
                token,
                user.getUserId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                (user.getFirstName() + " " + user.getLastName()).trim(),
                user.getProfilePicture(),
                roles));
    }

    // Added: Get current user profile for dashboard
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        List<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new UserProfileResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getAddress(),
                user.getProfilePicture(),
                roles));
    }

    // Refactored: Forgot password flow using 6-digit OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            // Generate a 6-digit OTP
            int otp = 100000 + new Random().nextInt(900000);

            // Fetch or create ForgotPassword entity
            ForgotPassword fp = forgotPasswordRepository.findByUser(user).orElse(new ForgotPassword());
            fp.setOtp(otp);
            fp.setExpirationTime(new Date(System.currentTimeMillis() + 10 * 60 * 1000)); // 10 mins expiry
            fp.setUser(user);
            forgotPasswordRepository.save(fp);

            MailBody mailBody = MailBody.builder()
                    .to(email)
                    .subject("Password Reset OTP")
                    .text("Your password reset OTP is: " + otp + "\nThis code will expire in 5 minutes.")
                    .build();
            emailService.sendSimpleMessage(mailBody);
        }
        return ResponseEntity
                .ok("We will send an OTP to reset your password.");
    }

    // New: Verify the 6-digit OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        Integer otp;
        try {
            otp = Integer.valueOf(request.get("otp").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid OTP format.");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        ForgotPassword fp = forgotPasswordRepository.findByOtpAndUser(otp, user).orElse(null);
        if (fp == null || fp.getExpirationTime().before(Date.from(Instant.now()))) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");
        }

        // Generate a short-lived UUID token just for the final reset step to prove
        // verification
        String tempToken = UUID.randomUUID().toString();
        user.setResetToken(tempToken);
        user.setResetTokenExpiry(System.currentTimeMillis() + 5 * 60 * 1000); // 5 mins expiry for final step
        userRepository.save(user);

        // Return the token to the frontend so it can be passed to the /reset-password
        // call
        return ResponseEntity.ok(tempToken);
    }

    // Refactored: Reset password flow (accepts the tempToken generated from
    // verification)
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request, @RequestParam String token) {
        String password = request.get("password");
        User user = userRepository.findByResetToken(token).orElse(null);

        if (user == null || user.getResetTokenExpiry() < System.currentTimeMillis()) {
            return ResponseEntity.badRequest().body("Invalid or expired reset session. Please verify OTP again.");
        }

        user.setPassword(passwordEncoder.encode(password));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        // Cleanup the used OTP from DB
        forgotPasswordRepository.findByUser(user).ifPresent(forgotPasswordRepository::delete);

        return ResponseEntity.ok("Password has been reset successfully!");
    }

}