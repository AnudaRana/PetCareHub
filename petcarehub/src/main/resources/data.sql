-- File: src/main/resources/data.sql
-- Pet Clinic Hub - Initial Setup
-- Passwords are bcrypt-encoded. Plain text password for all initial users is: 12345

-- ============================================================
-- INITIAL USERS
-- ============================================================
INSERT IGNORE INTO users (user_id, first_name, last_name, mobile_number, password, email, enabled)
VALUES
(1, 'Anuda',  'Ranasinghe', '0767716536',
 '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a',
 'ranasingheanuda@gmail.com', 1),

(2, 'Amaya', 'Gunasinghe', '0767717676',
 '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a',
 'amaya@gmail.com', 1),

(3, 'Vindya', 'Rupasinghe', '0767717673',
 '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a',
 'vindya@gmail.com', 1),

(4, 'Piyumi', 'Wickramasinghe', '0767717453',
 '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a',
 'piyumi@gmail.com', 1);

-- ============================================================
-- INITIAL ROLES
-- ============================================================
INSERT IGNORE INTO user_roles (user_id, role) VALUES
(1, 'OWNER'),
(2, 'OWNER'),
(3, 'OWNER'),
(4, 'OWNER');

-- Pets table is left completely empty at beginning as requested.
