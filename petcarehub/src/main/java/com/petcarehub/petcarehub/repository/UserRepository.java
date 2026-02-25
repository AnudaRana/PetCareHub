// File: src/main/java/com/petcarehub/petcarehub/repository/UserRepository.java
package com.petcarehub.petcarehub.repository;

import com.petcarehub.petcarehub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByEmailContainingIgnoreCase(String email);
}
