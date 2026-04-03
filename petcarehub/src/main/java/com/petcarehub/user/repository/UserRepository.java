package com.petcarehub.user.repository;

import com.petcarehub.user.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Added: Support for frontend reset password token logic
    Optional<User> findByResetToken(String resetToken);

    @Transactional
    @Modifying
    @Query("update User u set u.password = ?2 where u.email = ?1")
    void updatePassword(String email, String password);

    Optional<User> findByFirstNameAndLastName(String firstName, String lastName);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = 'ROLE_VET'")
    java.util.List<User> findAllVets();

}