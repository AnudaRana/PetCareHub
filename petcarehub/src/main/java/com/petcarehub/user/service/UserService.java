package com.petcarehub.user.service;

import com.petcarehub.auth.dto.RegisterRequest;
import com.petcarehub.user.dto.UserResponse;
import com.petcarehub.user.entity.Role;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 1. For Public Registration (AuthController)
    public UserResponse register(RegisterRequest request) {
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
                .enabled(true)
                .build();

        return toUserResponse(userRepository.save(user));
    }

    // 2. For Admin Creation (UserController)
    public UserResponse register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }

        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        user.setEnabled(true);
        return toUserResponse(userRepository.save(user));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserResponse toUserResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .toList();

        return new UserResponse(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getAddress(),
                user.getProfilePicture(),
                roles);
    }

    public List<UserResponse> getAllVets() {
        return userRepository.findAllVets().stream()
                .map(this::toUserResponse)
                .toList();
    }

}