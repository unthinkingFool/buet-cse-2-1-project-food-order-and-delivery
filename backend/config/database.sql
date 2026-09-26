s-- ============================================================
-- Food Delivery App — PostgreSQL Schema
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
DROP TABLE IF EXISTS DELIVERY_OTP CASCADE;

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
	socket_id       VARCHAR(255),
	isonline 		BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (latitude BETWEEN -90 AND 90),
    CHECK (longitude BETWEEN -180 AND 180)
);


-- ============================================================
-- SPATIAL INDEX
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
	rating_count 	INTEGER NOT NULL DEFAULT 0,

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

-- Protect delivery assignment invariants even if requests are handled by
-- separate Node.js processes. Historical completed assignments are allowed.
CREATE UNIQUE INDEX uq_active_delivery_assignment_per_shop_order
ON SHOP_ORDER_DELIVERY_ASSIGNMENT (shop_order_id)
WHERE assignment_status IN ('broadcasted', 'assigned');

CREATE UNIQUE INDEX uq_active_delivery_assignment_per_rider
ON SHOP_ORDER_DELIVERY_ASSIGNMENT (assigned_to)
WHERE assigned_to IS NOT NULL
  AND assignment_status = 'assigned';

CREATE INDEX idx_shop_order_active_rider
ON SHOP_ORDER (assigned_rider_id)
WHERE assigned_rider_id IS NOT NULL
  AND status NOT IN ('delivered', 'cancelled');

CREATE INDEX idx_delivery_assignment_active_rider
ON SHOP_ORDER_DELIVERY_ASSIGNMENT (assigned_to)
WHERE assigned_to IS NOT NULL
  AND assignment_status = 'assigned';


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

    order_item_id   INTEGER NOT NULL
                    REFERENCES ORDER_ITEM(id),

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

    order_id          INTEGER NOT NULL UNIQUE
                      REFERENCES FOOD_ORDER(id)
                      ON DELETE CASCADE,

    payment_provider  payment_provider_enum,

    method            payment_method_enum NOT NULL,

    transaction_id    VARCHAR(255) UNIQUE,

    amount            NUMERIC(10,2) NOT NULL,

    status            VARCHAR(20) NOT NULL DEFAULT 'pending',

    val_id            VARCHAR(255),

    bank_tran_id      VARCHAR(255),

    paid_at           TIMESTAMP,

    created_at        TIMESTAMP NOT NULL
                      DEFAULT CURRENT_TIMESTAMP,

    updated_at        TIMESTAMP NOT NULL
                      DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        status IN ('pending', 'paid', 'failed', 'cancelled')
    )
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

-- ===========================================================
-- DELIVERY VERIFICATION OTP
-- ===========================================================

CREATE TABLE DELIVERY_OTP (
    id              SERIAL PRIMARY KEY,

    order_id        INTEGER NOT NULL
                    REFERENCES FOOD_ORDER(id)
                    ON DELETE CASCADE,

    shop_order_id   INTEGER NOT NULL
                    REFERENCES SHOP_ORDER(id)
                    ON DELETE CASCADE,

    rider_id        INTEGER NOT NULL
                    REFERENCES CUSTOMER(id),

    customer_email  VARCHAR(255) NOT NULL,

    otp_hash        VARCHAR(255) NOT NULL,

    expires_at      TIMESTAMP NOT NULL,

    verified        BOOLEAN NOT NULL DEFAULT FALSE,

    created_at      TIMESTAMP NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_otp_shop_order
ON DELIVERY_OTP(shop_order_id);

CREATE INDEX idx_delivery_otp_rider
ON DELIVERY_OTP(rider_id);

CREATE INDEX idx_delivery_otp_customer_email
ON DELIVERY_OTP(customer_email);

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

-- ==
CREATE TABLE SUSPENED_EMAILS (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    role        customer_role_enum NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(email, role)
);

CREATE TABLE ISSUES (
    id                SERIAL PRIMARY KEY,

    sent_from_id      INTEGER NOT NULL
                      REFERENCES CUSTOMER(id),

    issue_against_id  INTEGER NOT NULL
                      REFERENCES CUSTOMER(id),

    issue_description VARCHAR(1000) NOT NULL,

    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (sent_from_id <> issue_against_id)
);

CREATE TABLE AUDIT_LOG (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    record_id INTEGER,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS SHOP_ORDER_STATUS_HISTORY (
    id              SERIAL PRIMARY KEY,
    shop_order_id   INTEGER NOT NULL
                    REFERENCES SHOP_ORDER(id)
                    ON DELETE CASCADE,
    old_status      order_status_enum NOT NULL,
    new_status      order_status_enum NOT NULL,
    changed_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- CSE216 database features: audit trigger, computed statistics, and delivery workflow.


CREATE TABLE SHOP_ORDER_STATUS_HISTORY (
    id SERIAL PRIMARY KEY,
    shop_order_id INTEGER NOT NULL REFERENCES SHOP_ORDER(id) ON DELETE CASCADE,
    old_status order_status_enum NOT NULL,
    new_status order_status_enum NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION log_shop_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO SHOP_ORDER_STATUS_HISTORY (shop_order_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$;

-- Keep stored item and restaurant ratings aligned when a review is created.
-- One customer may submit only one rating for one purchased order item.
CREATE UNIQUE INDEX IF NOT EXISTS uq_review_customer_order_item
ON REVIEW (customer_id, order_item_id);

CREATE OR REPLACE FUNCTION refresh_rating_summaries()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    restaurant_id_value INTEGER;
BEGIN

    -- Find the restaurant of the reviewed item
    SELECT restaurant_id
    INTO restaurant_id_value
    FROM ITEM
    WHERE id = NEW.item_id;

    -- Update item rating
    UPDATE ITEM
    SET rating = (
        SELECT ROUND(AVG(rating)::NUMERIC, 2)
        FROM REVIEW
        WHERE item_id = NEW.item_id
    )
    WHERE id = NEW.item_id;

    -- Update restaurant rating
    UPDATE RESTAURANT
    SET rating = (
        SELECT ROUND(AVG(rating)::NUMERIC, 2)
        FROM REVIEW r
        JOIN ITEM i ON i.id = r.item_id
        WHERE i.restaurant_id = restaurant_id_value
    )
    WHERE id = restaurant_id_value;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_refresh_rating_summaries
AFTER INSERT ON REVIEW
FOR EACH ROW
EXECUTE FUNCTION refresh_rating_summaries();


CREATE TRIGGER trg_log_shop_order_status_change
AFTER UPDATE OF status ON SHOP_ORDER
FOR EACH ROW EXECUTE FUNCTION log_shop_order_status_change();

CREATE OR REPLACE FUNCTION get_restaurant_delivery_statistics(p_restaurant_id INTEGER)
RETURNS TABLE (
    total_shop_orders BIGINT, delivered_orders BIGINT, cancelled_orders BIGINT,
    delivered_revenue NUMERIC, average_delivered_order_value NUMERIC
) LANGUAGE sql STABLE AS $$
    SELECT COUNT(*),
           COUNT(*) FILTER (WHERE status = 'delivered'),
           COUNT(*) FILTER (WHERE status = 'cancelled'),
           COALESCE(SUM(subtotal) FILTER (WHERE status = 'delivered'), 0),
           ROUND(COALESCE(AVG(subtotal) FILTER (WHERE status = 'delivered'), 0), 2)
    FROM SHOP_ORDER WHERE restaurant_id = p_restaurant_id;
$$;

CREATE OR REPLACE FUNCTION get_rider_delivery_statistics(p_rider_id INTEGER)
RETURNS TABLE (
    completed_deliveries BIGINT, active_deliveries BIGINT,
    delivered_order_value NUMERIC, average_delivered_order_value NUMERIC
) LANGUAGE sql STABLE AS $$
    SELECT COUNT(*) FILTER (WHERE status = 'delivered'),
           COUNT(*) FILTER (WHERE status NOT IN ('delivered', 'cancelled')),
           COALESCE(SUM(subtotal) FILTER (WHERE status = 'delivered'), 0),
           ROUND(COALESCE(AVG(subtotal) FILTER (WHERE status = 'delivered'), 0), 2)
    FROM SHOP_ORDER WHERE assigned_rider_id = p_rider_id;
$$;

CREATE OR REPLACE PROCEDURE complete_delivery(IN p_shop_order_id INTEGER, IN p_rider_id INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
    v_assigned_rider_id INTEGER;
    v_order_status order_status_enum;
    v_customer_id INTEGER;
    v_assignment_id INTEGER;
BEGIN
    SELECT so.assigned_rider_id, so.status, fo.customer_id
    INTO v_assigned_rider_id, v_order_status, v_customer_id
    FROM SHOP_ORDER so JOIN FOOD_ORDER fo ON fo.id = so.order_id
    WHERE so.id = p_shop_order_id FOR UPDATE OF so;



    IF NOT FOUND THEN RAISE EXCEPTION 'Shop order % does not exist', p_shop_order_id; END IF;

    IF v_assigned_rider_id IS DISTINCT FROM p_rider_id THEN RAISE EXCEPTION 'Delivery is not assigned to this rider'; END IF;


    IF v_order_status <> 'out_for_delivery' THEN RAISE EXCEPTION 'Only an out-for-delivery order can be completed'; END IF;


    UPDATE SHOP_ORDER_DELIVERY_ASSIGNMENT SET assignment_status = 'completed'
    WHERE shop_order_id = p_shop_order_id AND assigned_to = p_rider_id AND assignment_status = 'assigned'
    RETURNING id INTO v_assignment_id;

    IF v_assignment_id IS NULL THEN RAISE EXCEPTION 'Active delivery assignment was not found'; END IF;

    UPDATE SHOP_ORDER SET status = 'delivered', updated_at = CURRENT_TIMESTAMP WHERE id = p_shop_order_id;

    INSERT INTO NOTIFICATION (recipient_role, recipient_id, type, title, message, reference_id)
    VALUES ('customer', v_customer_id, 'delivery_completed', 'Order delivered',
      'Your order has been delivered successfully.', p_shop_order_id);
END;
$$;
