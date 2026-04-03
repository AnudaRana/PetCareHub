package com.petcarehub.config;

import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.entity.PetGender;
import com.petcarehub.pet.repository.PetRepository;
import com.petcarehub.user.entity.Role;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
@Profile({ "dev", "test" })
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // ── Admin / Vet seed (existing logic) ────────────────────────────────
        seedAdminUser();

        // ── Additional seed users ─────────────────────────────────────────────
        User owner = seedUser(
                "Amaya", "Gunasekara",
                "amayaswgunasekara4@gmail.com",
                "19112002@Aswg",
                "0750343267", "Kosgama",
                Set.of(Role.ROLE_OWNER)
        );

        seedUser(
                "Sanjeewani", "Perera",
                "sanjeewani42074@gmail.com",
                "sanP@829",
                "0773203829", "Suduwella",
                Set.of(Role.ROLE_VET)
        );

        seedUser(
                "Piyumali", "Ranasinghe",
                "cocobuddy1216@gmail.com",
                "py@1216",
                "0713508108", "Athurugiriya",
                Set.of(Role.ROLE_STAFF)
        );

        // ── Amaya's pets ──────────────────────────────────────────────────────
        if (owner != null) {
            seedPet("Browny", "Dog", "SL Hound", PetGender.FEMALE,
                    LocalDate.of(2016, 11, 23), 15.0, owner);

            seedPet("Lucky", "Dog", "SL Hound", PetGender.MALE,
                    LocalDate.of(2017, 8, 20), 17.0, owner);

            seedPet("Anna", "Cat", null, null,
                    LocalDate.of(2015, 12, 10), 2.0, owner);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void seedAdminUser() {
        final String adminEmail = "prasannapradeepkumara90@gmail.com";
        final String adminPassword = "ytfv bafc osjp qcvs"; // same as spring.mail.password

        if (userRepository.existsByEmail(adminEmail)) {
            User existing = userRepository.findByEmail(adminEmail).get();
            existing.setPassword(passwordEncoder.encode(adminPassword));
            if (existing.getRoles().isEmpty()) {
                existing.setRoles(new HashSet<>(Set.of(Role.ROLE_ADMIN, Role.ROLE_VET)));
            }
            userRepository.save(existing);
            System.out.println("[DataInitializer] Admin already exists — password synced.");
            return;
        }

        User admin = User.builder()
                .firstName("Prasanna")
                .lastName("Kumara")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .mobileNumber("1234567890")
                .address("Admin Address")
                .roles(new HashSet<>(Set.of(Role.ROLE_ADMIN, Role.ROLE_VET)))
                .enabled(true)
                .build();

        userRepository.save(admin);
        System.out.println("[DataInitializer] Admin user created: " + adminEmail);
    }

    /**
     * Creates a user if one with the given email doesn't already exist.
     * Returns the (possibly existing) User, or null on error.
     */
    private User seedUser(String firstName, String lastName,
                          String email, String rawPassword,
                          String mobile, String address,
                          Set<Role> roles) {
        if (userRepository.existsByEmail(email)) {
            System.out.println("[DataInitializer] User already exists, skipping: " + email);
            return userRepository.findByEmail(email).orElse(null);
        }

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .mobileNumber(mobile)
                .address(address)
                .roles(new HashSet<>(roles))
                .enabled(true)
                .build();

        userRepository.save(user);
        System.out.println("[DataInitializer] Created user: " + email + " " + roles);
        return user;
    }

    /**
     * Creates a pet for the given owner if a pet with that name and owner doesn't exist.
     */
    private void seedPet(String name, String species, String breed,
                         PetGender gender, LocalDate dob, Double weight,
                         User owner) {
        boolean exists = petRepository.findAll().stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(name)
                        && p.getOwner().getUserId().equals(owner.getUserId()));

        if (exists) {
            System.out.println("[DataInitializer] Pet already exists, skipping: " + name);
            return;
        }

        Pet pet = new Pet();
        pet.setName(name);
        pet.setSpecies(species);
        pet.setBreed(breed);
        pet.setGender(gender);
        pet.setDateOfBirth(dob);
        pet.setWeight(weight);
        pet.setOwner(owner);

        petRepository.save(pet);
        System.out.println("[DataInitializer] Created pet: " + name + " for " + owner.getEmail());
    }
}