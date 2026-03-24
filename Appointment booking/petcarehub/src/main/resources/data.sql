
-- ============================================================
-- INITIAL USERS
-- ============================================================
INSERT IGNORE INTO users (user_id, first_name, last_name, mobile_number, password, email, enabled)
VALUES
(1, 'Anuda',  'Ranasinghe', '0767716536',
 '12345',
 'ranasingheanuda@gmail.com', 1),

(2, 'Amaya', 'Gunasinghe', '0767717676',
 '12345',
 'amaya@gmail.com', 1),

(3, 'Vindya', 'Rupasinghe', '0767717673',
 '12345',
 'vindya@gmail.com', 1),

(4, 'Piyumi', 'Wickramasinghe', '0767717453',
 '12345',
 'piyumi@gmail.com', 1);


INSERT IGNORE INTO user_roles (user_id, role) VALUES
(1, 'OWNER'),
(2, 'OWNER'),
(3, 'OWNER'),
(4, 'OWNER');


INSERT IGNORE INTO users (user_id, first_name, last_name, mobile_number, password, email, enabled)
VALUES
(5, 'K.P.P', 'Kumara', '0776543210',
 '12345',
 'dr.Kumara@gmail.com', 1);

INSERT IGNORE INTO user_roles (user_id, role) VALUES
(5, 'VET');

INSERT IGNORE INTO users (user_id, first_name, last_name, mobile_number, password, email, enabled)
VALUES
(6, 'Dahamya', 'Kulandi', '0771234567',
 '12345',
 'staff@petcarehub.com', 1);
 
INSERT IGNORE INTO user_roles (user_id, role) VALUES (6, 'STAFF');
