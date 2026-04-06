-- ============================================================
-- INITIAL USERS
-- ============================================================
INSERT IGNORE INTO users (user_id, first_name, last_name, mobile_number, password, email, enabled)
VALUES
(1, 'Anuda',  'Ranasinghe', '0767716536', '12345', 'ranasingheanuda@gmail.com', 1),
(2, 'Amaya', 'Gunasinghe', '0767717676', '12345', 'amaya@gmail.com', 1),
(3, 'Vindya', 'Rupasinghe', '0767717673', '12345', 'vindya@gmail.com', 1),
(4, 'Piyumi', 'Wickramasinghe', '0767717453', '12345', 'piyumi@gmail.com', 1),
(5, 'Nimal', 'Perera', '0776543210', '12345', 'dr.nimal@petcarehub.com', 1),
(6, 'Dahamya', 'Kulandi', '0771234567', '12345', 'staff@petcarehub.com', 1);

INSERT IGNORE INTO user_roles (user_id, role) VALUES
(1, 'OWNER'),
(2, 'OWNER'),
(3, 'OWNER'),
(4, 'OWNER'),
(5, 'VET'),
(6, 'STAFF');

-- ============================================================
-- PETS
-- ============================================================
INSERT IGNORE INTO pets (pet_id, name, species, breed, gender, date_of_birth, weight, known_illnesses, pet_image_path, owner_id)
VALUES
(1, 'Bruno', 'Dog', 'Golden Retriever', 'MALE', '2021-05-10', 24.5, NULL, NULL, 1),
(2, 'Misty', 'Cat', 'Persian', 'FEMALE', '2022-03-12', 4.1, 'Sensitive skin', NULL, 1),
(3, 'Rocky', 'Dog', 'German Shepherd', 'MALE', '2020-11-08', 31.2, NULL, NULL, 2),
(4, 'Luna', 'Cat', 'Siamese', 'FEMALE', '2021-09-01', 3.8, NULL, NULL, 3),
(5, 'Coco', 'Rabbit', 'Mini Lop', 'FEMALE', '2023-01-15', 1.9, NULL, NULL, 4);

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT IGNORE INTO product (product_id, name, description, price, stock_quantity, image_url, image_content_type, category)
VALUES
(1, 'Premium Dog Food', 'Premium dog food - Chicken', 300.00, 200, NULL, NULL, 'Food'),
(2, 'Cat Grooming Kit', 'Complete grooming essentials for cats', 300.00, 200, NULL, NULL, 'Grooming'),
(3, 'Puppy Shampoo', 'Mild shampoo for puppies', 450.00, 75, NULL, NULL, 'Grooming');

-- ============================================================
-- CART
-- ============================================================
DELETE FROM cart WHERE user_id IN (1, 2);
INSERT INTO cart (cart_id, user_id, product_id, quantity)
VALUES
(1, 1, 1, 1),
(2, 1, 2, 1),
(3, 2, 1, 2),
(4, 2, 3, 1);
