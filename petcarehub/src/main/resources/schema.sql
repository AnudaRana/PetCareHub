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
    roles   ENUM('ROLE_ADMIN','ROLE_OWNER','ROLE_STAFF','ROLE_VET') NOT NULL,
    PRIMARY KEY (user_id, roles),
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
    pet_id                        BIGINT,
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
-- INVOICE
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id           BIGINT           NOT NULL AUTO_INCREMENT,
    invoice_number       VARCHAR(50)      NOT NULL UNIQUE,
    order_id             BIGINT           NOT NULL UNIQUE,
    owner_id             BIGINT           NOT NULL,
    pet_id               BIGINT,
    generated_by_staff   BIGINT           NOT NULL,
    payment_method       VARCHAR(50)      NOT NULL,
    payment_status       VARCHAR(50)      NOT NULL,
    payment_reference    VARCHAR(100),
    subtotal_amount      DECIMAL(10, 2)   NOT NULL,
    discount_amount      DECIMAL(10, 2)   NOT NULL DEFAULT 0.00,
    tax_amount           DECIMAL(10, 2)   NOT NULL DEFAULT 0.00,
    total_amount         DECIMAL(10, 2)   NOT NULL,
    notes                VARCHAR(255),
    created_at           TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (invoice_id),
    CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_invoice_owner FOREIGN KEY (owner_id) REFERENCES users(user_id),
    CONSTRAINT fk_invoice_pet FOREIGN KEY (pet_id) REFERENCES pets(pet_id),
    CONSTRAINT fk_invoice_staff FOREIGN KEY (generated_by_staff) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- INVOICE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_item (
    invoice_item_id      BIGINT           NOT NULL AUTO_INCREMENT,
    invoice_id           BIGINT           NOT NULL,
    product_id           BIGINT           NOT NULL,
    product_name         VARCHAR(100)     NOT NULL,
    unit_price           DECIMAL(10, 2)   NOT NULL,
    quantity             INT              NOT NULL,
    line_total           DECIMAL(10, 2)   NOT NULL,
    PRIMARY KEY (invoice_item_id),
    CONSTRAINT fk_invoice_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoice(invoice_id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_item_product FOREIGN KEY (product_id) REFERENCES product(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ORDER CANCELLATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_cancellations (
    cancellation_id BIGINT NOT NULL AUTO_INCREMENT,
    order_id        BIGINT NOT NULL,
    reason          VARCHAR(500) NOT NULL,
    cancelled_by    VARCHAR(100),
    cancelled_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cancellation_id),
    CONSTRAINT fk_cancellation_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ============================================================
-- FEEDBACKS
-- ============================================================
CREATE TABLE IF NOT EXISTS feedbacks (
    id             BIGINT          NOT NULL AUTO_INCREMENT,
    rating         INT             NOT NULL,
    comment        VARCHAR(2000),
    feedback_type  VARCHAR(50)     NOT NULL DEFAULT 'GENERAL',
    is_verified    BIT(1)          NOT NULL DEFAULT b'0',
    owner_id       BIGINT          NOT NULL,
    appointment_id BIGINT          NULL,
    product_id     BIGINT          NULL,
    staff_reply    VARCHAR(2000),
    created_date   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_feedbacks_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ensure appointment_id is nullable if table already exists
ALTER TABLE feedbacks MODIFY COLUMN appointment_id BIGINT NULL;
