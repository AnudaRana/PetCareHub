
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


INSERT IGNORE INTO user_roles (user_id, role) VALUES
(1, 'OWNER'),
(2, 'OWNER'),
(3, 'OWNER'),
(4, 'OWNER');


INSERT IGNORE INTO users (user_id, first_name, last_name, mobile_number, password, email, enabled)
VALUES
(5, 'Nimal', 'Perera', '0776543210',
 '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a',
 'dr.nimal@petcarehub.com', 1);

INSERT IGNORE INTO user_roles (user_id, role) VALUES
(5, 'VET');
