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
-- APPOINTMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    user_id          BIGINT       NOT NULL,
    pet_id           BIGINT       NOT NULL,
    appointment_type VARCHAR(100),
    doctor           VARCHAR(100),
    date             VARCHAR(50),
    time_slot        VARCHAR(50),
    price            DOUBLE,
    notes            TEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_appointments_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id)
        REFERENCES pets(pet_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
