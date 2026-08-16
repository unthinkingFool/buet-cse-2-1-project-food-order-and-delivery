-- ============================================================
-- Food Delivery App — PostgreSQL Schema
-- ============================================================

-- ============================================================
-- ENABLE POSTGIS
-- MongoDB 2dsphere equivalent for geographic coordinates
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;


-- ============================================================
-- DROP TABLES
-- ============================================================

DROP TABLE IF EXISTS PAYMENT CASCADE;
DROP TABLE IF EXISTS REVIEW CASCADE;
DROP TABLE IF EXISTS ORDER_ITEM CASCADE;
DROP TABLE IF EXISTS SHOP_ORDER_BROADCASTED_TO CASCADE;
DROP TABLE IF EXISTS SHOP_ORDER_DELIVERY_ASSIGNMENT CASCADE;
DROP TABLE IF EXISTS SHOP_ORDER CASCADE;
DROP TABLE IF EXISTS FOOD_ORDER CASCADE;
DROP TABLE IF EXISTS LOCATION CASCADE;
DROP TABLE IF EXISTS ITEM CASCADE;
DROP TABLE IF EXISTS CUSTOMER CASCADE;
DROP TABLE IF EXISTS RESTAURANT CASCADE;
DROP TABLE IF EXISTS PASSWORD_RESET CASCADE;
DROP TABLE IF EXISTS NOTIFICATION CASCADE;
DROP TABLE IF EXISTS ADMIN CASCADE;


-- ============================================================
-- DROP ENUM TYPES
-- ============================================================

DROP TYPE IF EXISTS restaurant_status_enum CASCADE;
DROP TYPE IF EXISTS customer_role_enum CASCADE;
DROP TYPE IF EXISTS order_status_enum CASCADE;
DROP TYPE IF EXISTS item_category_enum CASCADE;
DROP TYPE IF EXISTS food_type_enum CASCADE;
DROP TYPE IF EXISTS payment_provider_enum CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS assignment_status_enum CASCADE;


-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE restaurant_status_enum AS ENUM (
    'open',
    'closed'
);

CREATE TYPE customer_role_enum AS ENUM (
    'customer',
    'owner',
    'rider'
);

CREATE TYPE order_status_enum AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled'
);

CREATE TYPE item_category_enum AS ENUM (
    'burger',
    'pizza',
    'drink',
    'fries'
);

CREATE TYPE food_type_enum AS ENUM (
    'veg',
    'non-veg'
);

CREATE TYPE payment_provider_enum AS ENUM (
    'bkash',
    'nagad',
    'razorpay',
    'cash_on_delivery'
);

CREATE TYPE payment_method_enum AS ENUM (
    'cod',
    'online'
);

CREATE TYPE assignment_status_enum AS ENUM (
    'broadcasted',
    'assigned',
    'completed'
);


-- ============================================================
-- ADMIN
-- ============================================================

CREATE TABLE ADMIN (
    email           VARCHAR(255) PRIMARY KEY,
    hashed_password VARCHAR(255) NOT NULL
);


-- ============================================================
-- CUSTOMER
--
-- latitude / longitude:
--     Current GPS position
--
-- location:
--     PostGIS geography point
--     Equivalent concept to MongoDB 2dsphere location
--
-- Default location:
--     POINT(0 0)
-- ============================================================

CREATE TABLE CUSTOMER (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    contact_no      VARCHAR(50) NOT NULL,
    role            customer_role_enum NOT NULL DEFAULT 'customer',

    latitude        DECIMAL(10, 8) NOT NULL DEFAULT 0,
    longitude       DECIMAL(11, 8) NOT NULL DEFAULT 0,

    location        GEOGRAPHY(POINT, 4326)
                    NOT NULL
                    DEFAULT ST_SetSRID(
                        ST_MakePoint(0, 0),
                        4326
                    )::geography,

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (latitude BETWEEN -90 AND 90),
    CHECK (longitude BETWEEN -180 AND 180)
);


-- ============================================================
-- SPATIAL INDEX
--
-- This makes nearby-location queries efficient.
-- ============================================================

CREATE INDEX idx_customer_location
ON CUSTOMER
USING GIST (location);


-- ============================================================
-- RESTAURANT
-- ============================================================

CREATE TABLE RESTAURANT (
    id              SERIAL PRIMARY KEY,
    owner_id        INTEGER NOT NULL REFERENCES CUSTOMER(id),
    is_approved     BOOLEAN NOT NULL DEFAULT FALSE,
    status          restaurant_status_enum NOT NULL DEFAULT 'closed',
    name            VARCHAR(255) NOT NULL,
    image_link      VARCHAR(500),
    description     TEXT,
    address         VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    contact_no      VARCHAR(50),
    rating          NUMERIC(3,2),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (rating IS NULL OR rating BETWEEN 0 AND 5)
);


-- ============================================================
-- ITEM
-- ============================================================

CREATE TABLE ITEM (
    id              SERIAL PRIMARY KEY,
    restaurant_id   INTEGER NOT NULL
                    REFERENCES RESTAURANT(id)
                    ON DELETE CASCADE,

    name            VARCHAR(255) NOT NULL,
    category        item_category_enum,
    food_type       food_type_enum,
    description     VARCHAR(500),
    price           NUMERIC(10,2) NOT NULL,
    discount_price  NUMERIC(10,2),
    image_link      VARCHAR(500),
    total_sold      INTEGER DEFAULT 0,
    rating          NUMERIC(3,2),

    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    isavailable     BOOLEAN NOT NULL DEFAULT TRUE,

    CHECK (price >= 0),
    CHECK (
        discount_price IS NULL
        OR discount_price >= 0
    ),
    CHECK (
        rating IS NULL
        OR rating BETWEEN 0 AND 5
    )
);


-- ============================================================
-- LOCATION
-- CUSTOMER SAVED DELIVERY ADDRESSES
-- ============================================================

CREATE TABLE LOCATION (
    id              SERIAL PRIMARY KEY,
    customer_id     INTEGER NOT NULL
                    REFERENCES CUSTOMER(id),

    road            VARCHAR(255),
    city            VARCHAR(100)
);


-- ============================================================
-- FOOD_ORDER
-- ============================================================

CREATE TABLE FOOD_ORDER (
    id              SERIAL PRIMARY KEY,

    customer_id     INTEGER NOT NULL
                    REFERENCES CUSTOMER(id),

    payment_method  payment_method_enum NOT NULL,

    delivery_address TEXT NOT NULL,

    latitude        DECIMAL(10, 8) NOT NULL,
    longitude       DECIMAL(11, 8) NOT NULL,

    total_amount    DECIMAL(10, 2) NOT NULL,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- SHOP_ORDER
-- ============================================================

CREATE TABLE SHOP_ORDER (
    id              SERIAL PRIMARY KEY,

    order_id        INTEGER NOT NULL
                    REFERENCES FOOD_ORDER(id)
                    ON DELETE CASCADE,

    restaurant_id   INTEGER NOT NULL
                    REFERENCES RESTAURANT(id),

    owner_id        INTEGER NOT NULL
                    REFERENCES CUSTOMER(id),

    subtotal        DECIMAL(10, 2) NOT NULL,

    -- Rider is now a CUSTOMER whose role = rider
    assigned_rider_id
                    INTEGER
                    REFERENCES CUSTOMER(id),

    status          order_status_enum NOT NULL DEFAULT 'pending',

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- SHOP_ORDER_DELIVERY_ASSIGNMENT
--
-- One delivery assignment for a SHOP_ORDER.
--
-- assigned_to references CUSTOMER(id)
-- and application logic ensures role = 'rider'.
-- ============================================================

CREATE TABLE SHOP_ORDER_DELIVERY_ASSIGNMENT (
    id              SERIAL PRIMARY KEY,

    order_id        INTEGER NOT NULL
                    REFERENCES FOOD_ORDER(id)
                    ON DELETE CASCADE,

    shop_order_id   INTEGER NOT NULL
                    REFERENCES SHOP_ORDER(id)
                    ON DELETE CASCADE,

    restaurant_id   INTEGER NOT NULL
                    REFERENCES RESTAURANT(id),

    total_amount    DECIMAL(10, 2) NOT NULL,

    assigned_to     INTEGER
                    REFERENCES CUSTOMER(id),

    assignment_status
                    assignment_status_enum
                    NOT NULL DEFAULT 'broadcasted',

    accepted_at     TIMESTAMP,

    created_at      TIMESTAMP NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- SHOP_ORDER_BROADCASTED_TO
--
-- Stores every rider who receives a delivery broadcast.
--
-- customer_id references CUSTOMER(id)
-- and application logic ensures role = rider.
-- ============================================================

CREATE TABLE SHOP_ORDER_BROADCASTED_TO (
    id                  SERIAL PRIMARY KEY,

    shop_order_id       INTEGER NOT NULL
                        REFERENCES SHOP_ORDER(id)
                        ON DELETE CASCADE,

    delivery_assignment_id
                        INTEGER NOT NULL
                        REFERENCES SHOP_ORDER_DELIVERY_ASSIGNMENT(id)
                        ON DELETE CASCADE,

    customer_id         INTEGER NOT NULL
                        REFERENCES CUSTOMER(id)
);


-- ============================================================
-- ORDER_ITEM
-- ============================================================

CREATE TABLE ORDER_ITEM (
    id              SERIAL PRIMARY KEY,

    shop_order_id   INTEGER NOT NULL
                    REFERENCES SHOP_ORDER(id)
                    ON DELETE CASCADE,

    item_id         INTEGER NOT NULL
                    REFERENCES ITEM(id),

    restaurant_id   INTEGER NOT NULL
                    REFERENCES RESTAURANT(id),

    price           DECIMAL(10, 2) NOT NULL,

    quantity        INTEGER NOT NULL
                    CHECK (quantity > 0),

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- REVIEW
-- ============================================================

CREATE TABLE REVIEW (
    id              SERIAL PRIMARY KEY,

    item_id         INTEGER NOT NULL
                    REFERENCES ITEM(id),

    customer_id     INTEGER NOT NULL
                    REFERENCES CUSTOMER(id),

    rating          SMALLINT NOT NULL,

    description     VARCHAR(500),

    CHECK (rating BETWEEN 1 AND 5)
);


-- ============================================================
-- PAYMENT
-- ============================================================

CREATE TABLE PAYMENT (
    id                SERIAL PRIMARY KEY,

    order_id          INTEGER NOT NULL
                      REFERENCES FOOD_ORDER(id),

    payment_provider  payment_provider_enum,

    method            payment_method_enum,

    transaction_id    VARCHAR(255),

    paid_at           TIMESTAMP NOT NULL
                      DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- PASSWORD RESET
-- ============================================================

CREATE TABLE PASSWORD_RESET (
    id              SERIAL PRIMARY KEY,

    email           VARCHAR(255) NOT NULL,

    role            VARCHAR(20) NOT NULL,

    otp_hash        VARCHAR(255) NOT NULL,

    expires_at      TIMESTAMP NOT NULL,

    verified        BOOLEAN NOT NULL DEFAULT FALSE,

    created_at      TIMESTAMP NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        role IN ('customer', 'restaurant', 'rider')
    )
);


-- ============================================================
-- NOTIFICATION
-- ============================================================

CREATE TABLE NOTIFICATION (
    id              SERIAL PRIMARY KEY,

    recipient_role  VARCHAR(20) NOT NULL,

    recipient_id    INTEGER NOT NULL,

    type            VARCHAR(50) NOT NULL,

    title           VARCHAR(255) NOT NULL,

    message         VARCHAR(500) NOT NULL,

    reference_id    INTEGER,

    is_read         BOOLEAN NOT NULL DEFAULT FALSE,

    created_at      TIMESTAMP NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
);