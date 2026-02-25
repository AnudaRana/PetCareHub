-- File: src/main/resources/data.sql
-- Pet Clinic Hub - Sample Data
-- Passwords are bcrypt-encoded. Plain text passwords:
--   user1: Password@123
--   user2: Password@456

-- ============================================================
-- SAMPLE USERS
-- ============================================================
INSERT IGNORE INTO users (user_id, first_name, last_name, mobile_number, password, email, enabled)
VALUES
(1, 'Sarah',  'Johnson', '0771234567',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'sarah.johnson@example.com', 1),

(2, 'Michael', 'Fernando', '0779876543',
 '$2a$10$WApLHMbfR.2GrxNiGkQ/.eU9x9bD/u2g8nGJPi0x8ZQXg7w2wLnzO',
 'michael.fernando@example.com', 1);

-- ============================================================
-- SAMPLE ROLES
-- ============================================================
INSERT IGNORE INTO user_roles (user_id, role) VALUES
(1, 'OWNER'),
(2, 'OWNER');

-- ============================================================
-- SAMPLE PETS
-- ============================================================
INSERT IGNORE INTO pets (pet_id, name, species, breed, gender, date_of_birth, weight, known_illnesses, pet_image_path, owner_id)
VALUES
(1, 'Buddy',   'Dog',  'Golden Retriever', 'MALE',   '2021-03-15', 28.5,
 'None', NULL, 1),

(2, 'Whiskers','Cat',  'Persian',          'FEMALE', '2020-07-20', 4.2,
 'Mild allergies to certain foods', NULL, 1),

(3, 'Rocky',   'Dog',  'German Shepherd',  'MALE',   '2019-11-05', 32.0,
 'Hip dysplasia - mild', NULL, 2),

(4, 'Luna',    'Cat',  'Siamese',          'FEMALE', '2022-01-10', 3.8,
 'None', NULL, 2);
