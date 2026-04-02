-- ==============================
-- USERS (exact from screenshot)
-- ==============================
CREATE TABLE IF NOT EXISTS users (
    user_id            BIGINT       NOT NULL,
    address            VARCHAR(255)  NULL,
    email              VARCHAR(255)  NOT NULL,
    enabled            BIT(1)        NOT NULL,
    first_name         VARCHAR(255)  NULL,
    last_name          VARCHAR(255)  NULL,
    mobile_number      VARCHAR(255)  NULL,
    password           VARCHAR(255)  NOT NULL,
    profile_picture    LONGBLOB      NULL,
    reset_token        VARCHAR(255)  NULL,
    reset_token_expiry BIGINT        NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- USER ROLES (matches YOUR seed)
-- ==============================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- HIBERNATE SEQUENCE (needed for GenerationType.AUTO on MySQL when no auto_increment)
-- ==============================
CREATE TABLE IF NOT EXISTS hibernate_sequence (
    next_val BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO hibernate_sequence (next_val)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM hibernate_sequence);

-- ==============================
-- FORGOT PASSWORD
-- ==============================
CREATE TABLE IF NOT EXISTS forgot_password (
    fp_id BIGINT NOT NULL AUTO_INCREMENT,
    otp INT NOT NULL,
    expiration_time DATETIME NOT NULL,
    user_id BIGINT UNIQUE,
    PRIMARY KEY (fp_id),
    CONSTRAINT fk_fp_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- PETS (as you provided)
-- ==============================
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

-- ==============================
-- PRODUCT (with image)
-- ==============================
CREATE TABLE IF NOT EXISTS product (
    product_id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    image LONGBLOB NULL,
    image_content_type VARCHAR(100) NULL,
    PRIMARY KEY (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================
-- CART
-- ==============================
CREATE TABLE IF NOT EXISTS cart (
    cart_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (cart_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
