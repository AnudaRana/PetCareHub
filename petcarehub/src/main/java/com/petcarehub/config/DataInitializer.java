package com.petcarehub.config;

import com.petcarehub.user.entity.Role;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@Profile({ "dev", "test" })
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "prasannapradeepkumara90@gmail.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";
    private static final String DEFAULT_PHONE = "1234567890";
    private static final String DEFAULT_ADDRESS = "Admin Address";

    @Override
    public void run(String... args) throws Exception {
        // Fix: Check if user exists, and if so, ensure the password is encoded properly
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            User existingAdmin = userRepository.findByEmail(ADMIN_EMAIL).get();
            existingAdmin.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
            if (existingAdmin.getRoles().isEmpty()) {
                existingAdmin.setRoles(new HashSet<>(Set.of(Role.ROLE_ADMIN, Role.ROLE_VET)));
            }
            userRepository.save(existingAdmin);
            System.out.println("Admin user already exists. Re-encoding password to ensure login works.");
            return;
        }

        User admin = User.builder()
                .firstName("Admin")
                .lastName("Vet")
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                .mobileNumber(DEFAULT_PHONE)
                .address(DEFAULT_ADDRESS)
                .roles(new HashSet<>(Set.of(Role.ROLE_ADMIN, Role.ROLE_VET)))
                .enabled(true)
                .build();

        userRepository.save(admin);
        System.out.println("Default admin user created successfully: " + ADMIN_EMAIL);
    }
}