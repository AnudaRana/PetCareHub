package com.petcarehub.user.service;

import com.petcarehub.auth.dto.RegisterRequest;
import com.petcarehub.user.dto.UpdateProfileRequest;
import com.petcarehub.user.dto.UserProfileResponse;
import com.petcarehub.user.entity.Role;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Add to UserService.java:

    public User registerUser(User user) {
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }

        // Encode password if not already encoded
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // Ensure user is enabled
        user.setEnabled(true);

        return userRepository.save(user);
    }

    public User updateUser(User user) {
        // Check if user exists
        User existingUser = userRepository.findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + user.getUserId()));

        // Update fields
        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setEmail(user.getEmail());
        existingUser.setMobileNumber(user.getMobileNumber());
        existingUser.setAddress(user.getAddress());
        existingUser.setRoles(user.getRoles());

        // Update password only if provided and changed
        if (user.getPassword() != null && !user.getPassword().isBlank()
                && !user.getPassword().equals(existingUser.getPassword())) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobileNumber(request.getMobileNumber())
                .address(request.getAddress())
                .roles(new HashSet<>(Set.of(Role.ROLE_OWNER)))
                .enabled(true)                  // ← ADD THIS LINE
                .build();

        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserProfileResponse getUserProfile(String email) {
        User user = getUserByEmail(email);
        return toProfileResponse(user);
    }

    public UserProfileResponse getUserProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toProfileResponse(user);
    }

    public UserProfileResponse updateUserProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already taken");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobileNumber(request.getMobileNumber());
        user.setAddress(request.getAddress());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        return toProfileResponse(user);
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    private UserProfileResponse toProfileResponse(User user) {
        String fullName = user.getFirstName() + " " + user.getLastName();
        List<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        return new UserProfileResponse(
                user.getUserId(),
                fullName,
                user.getEmail(),
                user.getMobileNumber(),
                user.getAddress(),
                roles
        );
    }
}