package com.petcarehub.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long userId;

    private String firstName;
    private String lastName;
    private String mobileNumber;

    @NotEmpty
    private String password;

    @NotEmpty
    @Email
    @Column(unique = true)
    private String email;
    private String address;

    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = new HashSet<>();

    private boolean enabled = true;

    @PrePersist
    public void setDefaultRole() {
        if (roles.isEmpty()) {
            roles.add(Role.ROLE_OWNER);
        }
    }

    private String resetToken;
    private Long resetTokenExpiry;
}


