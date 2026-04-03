package com.petcarehub.security;

import com.petcarehub.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private final long EXPIRATION_TIME = 86400000;

    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();

        // Add roles claim
        List<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());
        claims.put("roles", roles);
        claims.put("userId", user.getUserId());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSignKey())
                .compact();
    }

    public String extractUsername(String token) {
        return safeExtractClaim(token, Claims::getSubject);
    }

    public List<String> extractRoles(String token) {
        Claims claims = safeExtractAllClaims(token);
        if (claims == null) return Collections.emptyList();
        return claims.get("roles", List.class);
    }

    public Date extractExpiration(String token) {
        return safeExtractClaim(token, Claims::getExpiration);
    }

    private <T> T safeExtractClaim(String token, Function<Claims, T> resolver) {
        try {
            final Claims claims = safeExtractAllClaims(token);
            return claims != null ? resolver.apply(claims) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Claims safeExtractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }

    public Boolean validateToken(String token, String username) {
        final String extracted = extractUsername(token);
        final Date expiration = extractExpiration(token);
        return extracted != null &&
                extracted.equals(username) &&
                (expiration == null || !expiration.before(new Date()));
    }

}