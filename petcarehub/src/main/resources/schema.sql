CREATE DATABASE IF NOT EXISTS petcarehub;
USE petcarehub;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id      BIGINT       NOT NULL AUTO_INCREMENT,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20),
    password     VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    enabled      TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- USER_ROLES TABLE (Set<String> roles on User entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id      BIGINT      NOT NULL,
    role         VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PETS TABLE
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
-- MEDICAL_RECORDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_records (
    medical_record_id BIGINT NOT NULL AUTO_INCREMENT,
    pet_id BIGINT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (medical_record_id),
    CONSTRAINT fk_medical_records_pet FOREIGN KEY (pet_id)
        REFERENCES pets(pet_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- MEDICAL_TREATMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_treatments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    treatment_date DATE NOT NULL,
    diagnosis TEXT,
    doctor_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(255) NOT NULL,
    treatment_notes TEXT,
    prescriptions TEXT,
    physical_observation TEXT,
    pet_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_medical_treatments_pet FOREIGN KEY (pet_id)
        REFERENCES pets(pet_id) ON DELETE CASCADE
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
