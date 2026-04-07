CREATE DATABASE IF NOT EXISTS petcarehub;
USE petcarehub;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id            BIGINT          NOT NULL,
    address            VARCHAR(255),
    email              VARCHAR(255)    NOT NULL,
    enabled            BIT(1)          NOT NULL,
    first_name         VARCHAR(255),
    last_name          VARCHAR(255),
    mobile_number      VARCHAR(255),
    password           VARCHAR(255)    NOT NULL,
    profile_picture    LONGBLOB,
    reset_token        VARCHAR(255),
    reset_token_expiry BIGINT,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- USER ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- HIBERNATE SEQUENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS hibernate_sequence (
    next_val BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO hibernate_sequence (next_val)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM hibernate_sequence);

-- ============================================================
-- FORGOT PASSWORD
-- ============================================================
CREATE TABLE IF NOT EXISTS forgot_password (
    fp_id BIGINT NOT NULL AUTO_INCREMENT,
    otp INT NOT NULL,
    expiration_time DATETIME NOT NULL,
    user_id BIGINT UNIQUE,
    PRIMARY KEY (fp_id),
    CONSTRAINT fk_fp_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PETS
-- ============================================================
CREATE TABLE IF NOT EXISTS pets (
    pet_id          BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    species         VARCHAR(100)    NOT NULL,
    breed           VARCHAR(100),
    gender          ENUM('MALE','FEMALE','UNKNOWN'),
    date_of_birth   DATE            NOT NULL,
    weight          DOUBLE,
    known_illnesses TEXT,
    pet_image_path  VARCHAR(255),
    owner_id        BIGINT          NOT NULL,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pet_id),
    CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PRODUCT
-- ============================================================
CREATE TABLE IF NOT EXISTS product (
    product_id          BIGINT          NOT NULL AUTO_INCREMENT,
    name                VARCHAR(100)    NOT NULL,
    description         VARCHAR(255),
    price               DECIMAL(10, 2)  NOT NULL,
    stock_quantity      INT             NOT NULL,
    image_url           VARCHAR(255),
    image_content_type  VARCHAR(100),
    category            VARCHAR(100),
    PRIMARY KEY (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- CART
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
    cart_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (cart_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id                      BIGINT           NOT NULL AUTO_INCREMENT,
    order_number                  VARCHAR(50)      UNIQUE,
    user_id                       BIGINT           NOT NULL,
    pet_id                        BIGINT           NOT NULL,
    owner_full_name               VARCHAR(150)     NOT NULL,
    owner_email                   VARCHAR(150)     NOT NULL,
    contact_number                VARCHAR(50)      NOT NULL,
    pickup_date                   DATE             NOT NULL,
    additional_notes              TEXT,
    sub_total                     DECIMAL(10, 2)   NOT NULL,
    pickup_fee                    DECIMAL(10, 2)   NOT NULL DEFAULT 0.00,
    total                         DECIMAL(10, 2)   NOT NULL,
    order_status                  VARCHAR(40)      NOT NULL,
    payment_status                VARCHAR(40)      NOT NULL,
    payment_method                VARCHAR(40),
    bank_name                     VARCHAR(100),
    bank_account_name             VARCHAR(100),
    bank_account_number           VARCHAR(50),
    bank_branch                   VARCHAR(100),
    payment_receipt_file_name     VARCHAR(255),
    payment_receipt_content_type  VARCHAR(100),
    payment_receipt               LONGBLOB,
    created_at                    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    placed_at                     DATETIME,
    PRIMARY KEY (order_id),
    UNIQUE KEY uk_orders_order_number (order_number),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_pet FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id BIGINT NOT NULL AUTO_INCREMENT,
    order_id      BIGINT          NOT NULL,
    product_id    BIGINT          NOT NULL,
    product_name  VARCHAR(100)    NOT NULL,
    product_price DECIMAL(10, 2)  NOT NULL,
    quantity      INT             NOT NULL,
    line_total    DECIMAL(10, 2)  NOT NULL,
    PRIMARY KEY (order_item_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PRODUCT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product (
    product_id          BIGINT          NOT NULL AUTO_INCREMENT,
    name                VARCHAR(100)    NOT NULL,
    description         VARCHAR(255),
    price               DECIMAL(10, 2)  NOT NULL,
    stock_quantity      INT             NOT NULL,
    image_url           VARCHAR(255),
    image_content_type  VARCHAR(100),
    category            VARCHAR(100),
    PRIMARY KEY (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PRODUCT_ATTRIBUTE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_attribute (
    product_id  BIGINT          NOT NULL,
    brand       VARCHAR(100),
    variants    VARCHAR(255),
    colors      VARCHAR(255),
    flavors     VARCHAR(255),
    category    VARCHAR(100),
    PRIMARY KEY (product_id),
    CONSTRAINT fk_product_attribute_product FOREIGN KEY (product_id)
        REFERENCES product(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
