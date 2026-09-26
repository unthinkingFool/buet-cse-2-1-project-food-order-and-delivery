-- ============================================================
-- 1. COMMON UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_customer_updated_at ON CUSTOMER;
CREATE TRIGGER trg_customer_updated_at
BEFORE UPDATE ON CUSTOMER
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_item_updated_at ON ITEM;
CREATE TRIGGER trg_item_updated_at
BEFORE UPDATE ON ITEM
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_food_order_updated_at ON FOOD_ORDER;
CREATE TRIGGER trg_food_order_updated_at
BEFORE UPDATE ON FOOD_ORDER
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_shop_order_updated_at ON SHOP_ORDER;
CREATE TRIGGER trg_shop_order_updated_at
BEFORE UPDATE ON SHOP_ORDER
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_payment_updated_at ON PAYMENT;
CREATE TRIGGER trg_payment_updated_at
BEFORE UPDATE ON PAYMENT
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 2. KEEP CUSTOMER LAT/LONG AND POSTGIS LOCATION CONSISTENT
--
-- The REST location endpoint updates all three values.
-- Socket.IO currently updates only the PostGIS location.
-- This trigger keeps both representations synchronized.
-- ============================================================

CREATE OR REPLACE FUNCTION sync_customer_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Location changed while latitude/longitude did not change:
    -- derive scalar coordinates from the PostGIS point.
    IF TG_OP = 'UPDATE'
       AND NEW.location IS DISTINCT FROM OLD.location
       AND NEW.latitude = OLD.latitude
       AND NEW.longitude = OLD.longitude
    THEN
        NEW.longitude := ST_X(NEW.location::geometry);
        NEW.latitude  := ST_Y(NEW.location::geometry);
    ELSE
        -- Latitude/longitude are the authoritative scalar values
        -- whenever they are supplied/changed.
        NEW.location := ST_SetSRID(
            ST_MakePoint(
                NEW.longitude::double precision,
                NEW.latitude::double precision
            ),
            4326
        )::geography;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_customer_location ON CUSTOMER;
CREATE TRIGGER trg_sync_customer_location
BEFORE INSERT OR UPDATE OF latitude, longitude, location ON CUSTOMER
FOR EACH ROW
EXECUTE FUNCTION sync_customer_location();


-- ============================================================
-- 3. SHOP ORDER STATUS AUDIT
-- ============================================================

CREATE TABLE IF NOT EXISTS SHOP_ORDER_STATUS_HISTORY (
    id              SERIAL PRIMARY KEY,
    shop_order_id   INTEGER NOT NULL
                    REFERENCES SHOP_ORDER(id)
                    ON DELETE CASCADE,
    old_status      order_status_enum NOT NULL,
    new_status      order_status_enum NOT NULL,
    changed_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION log_shop_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO SHOP_ORDER_STATUS_HISTORY
        (
            shop_order_id,
            old_status,
            new_status
        )
        VALUES
        (
            NEW.id,
            OLD.status,
            NEW.status
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_shop_order_status_change ON SHOP_ORDER;
CREATE TRIGGER trg_log_shop_order_status_change
AFTER UPDATE OF status ON SHOP_ORDER
FOR EACH ROW
EXECUTE FUNCTION log_shop_order_status_change();


-- ============================================================
-- 4. MAINTAIN ITEM TOTAL_SOLD FROM ACTUAL DELIVERED ORDERS
--
-- Existing application behavior defines "total sold" as the
-- quantity belonging to delivered SHOP_ORDER records.
-- Therefore the cached ITEM.total_sold is changed only when an
-- order crosses the delivered boundary.
-- ============================================================

CREATE OR REPLACE FUNCTION maintain_item_total_sold()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Order becomes delivered.
    IF OLD.status IS DISTINCT FROM 'delivered'
       AND NEW.status = 'delivered'
    THEN
        UPDATE ITEM i
        SET total_sold = COALESCE(i.total_sold, 0) + x.quantity
        FROM (
            SELECT item_id, SUM(quantity)::INTEGER AS quantity
            FROM ORDER_ITEM
            WHERE shop_order_id = NEW.id
            GROUP BY item_id
        ) x
        WHERE i.id = x.item_id;
    END IF;

    -- A previously delivered order is moved away from delivered.
    -- This keeps the cached value consistent if an administrative
    -- correction/cancellation is performed later.
    IF OLD.status = 'delivered'
       AND NEW.status IS DISTINCT FROM 'delivered'
    THEN
        UPDATE ITEM i
        SET total_sold = GREATEST(0, COALESCE(i.total_sold, 0) - x.quantity)
        FROM (
            SELECT item_id, SUM(quantity)::INTEGER AS quantity
            FROM ORDER_ITEM
            WHERE shop_order_id = NEW.id
            GROUP BY item_id
        ) x
        WHERE i.id = x.item_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintain_item_total_sold ON SHOP_ORDER;
CREATE TRIGGER trg_maintain_item_total_sold
AFTER UPDATE OF status ON SHOP_ORDER
FOR EACH ROW
EXECUTE FUNCTION maintain_item_total_sold();


-- ============================================================
-- 5. RATING AGGREGATION
--
-- Keeps ITEM.rating, ITEM.rating_count and RESTAURANT.rating
-- synchronized for INSERT / UPDATE / DELETE of reviews.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_review_customer_order_item
ON REVIEW (customer_id, order_item_id);


CREATE OR REPLACE FUNCTION refresh_rating_summaries()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_restaurant_id INTEGER;
BEGIN
    -- Find restaurant of the reviewed item
    SELECT restaurant_id
    INTO v_restaurant_id
    FROM ITEM
    WHERE id = NEW.item_id;

    -- Update item rating and rating count
    UPDATE ITEM
    SET
        rating = (
            SELECT ROUND(AVG(r.rating)::NUMERIC, 2)
            FROM REVIEW r
            WHERE r.item_id = NEW.item_id
        ),
        rating_count = (
            SELECT COUNT(*)::INTEGER
            FROM REVIEW r
            WHERE r.item_id = NEW.item_id
        )
    WHERE id = NEW.item_id;

    -- Update restaurant rating
    UPDATE RESTAURANT
    SET rating = (
        SELECT ROUND(AVG(r.rating)::NUMERIC, 2)
        FROM REVIEW r
        JOIN ITEM i ON i.id = r.item_id
        WHERE i.restaurant_id = v_restaurant_id
    )
    WHERE id = v_restaurant_id;

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS trg_refresh_rating_summaries ON REVIEW;

CREATE TRIGGER trg_refresh_rating_summaries
AFTER INSERT ON REVIEW
FOR EACH ROW
EXECUTE FUNCTION refresh_rating_summaries();

-- ============================================================
-- 6. DATABASE-LEVEL REVIEW VALIDATION
--
-- Controller already performs this check. The trigger protects
-- the invariant even when REVIEW is inserted directly in SQL.
-- ============================================================

CREATE OR REPLACE FUNCTION validate_review_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_customer_id INTEGER;
    v_status order_status_enum;
    v_item_id INTEGER;
BEGIN
    SELECT
        fo.customer_id,
        so.status,
        oi.item_id
    INTO
        v_customer_id,
        v_status,
        v_item_id
    FROM ORDER_ITEM oi
    JOIN SHOP_ORDER so ON so.id = oi.shop_order_id
    JOIN FOOD_ORDER fo ON fo.id = so.order_id
    WHERE oi.id = NEW.order_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order item % does not exist', NEW.order_item_id;
    END IF;

    IF v_customer_id <> NEW.customer_id THEN
        RAISE EXCEPTION 'Customer % did not place this order item', NEW.customer_id;
    END IF;

    IF v_status <> 'delivered' THEN
        RAISE EXCEPTION 'Only delivered order items can be reviewed';
    END IF;

    IF NEW.item_id <> v_item_id THEN
        RAISE EXCEPTION 'Review item does not match order item';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_review_purchase ON REVIEW;
CREATE TRIGGER trg_validate_review_purchase
BEFORE INSERT OR UPDATE ON REVIEW
FOR EACH ROW
EXECUTE FUNCTION validate_review_purchase();


-- ============================================================
-- 7. RIDER ROLE / ASSIGNMENT INTEGRITY
-- ============================================================

CREATE OR REPLACE FUNCTION validate_assigned_rider()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_role customer_role_enum;
BEGIN
    IF NEW.assigned_rider_id IS NOT NULL THEN
        SELECT role
        INTO v_role
        FROM CUSTOMER
        WHERE id = NEW.assigned_rider_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Assigned rider % does not exist', NEW.assigned_rider_id;
        END IF;

        IF v_role <> 'rider' THEN
            RAISE EXCEPTION 'Customer % is not a rider', NEW.assigned_rider_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_shop_order_rider ON SHOP_ORDER;
CREATE TRIGGER trg_validate_shop_order_rider
BEFORE INSERT OR UPDATE OF assigned_rider_id ON SHOP_ORDER
FOR EACH ROW
EXECUTE FUNCTION validate_assigned_rider();

CREATE OR REPLACE FUNCTION validate_delivery_assignment_rider()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_role customer_role_enum;
BEGIN
    IF NEW.assigned_to IS NOT NULL THEN
        SELECT role
        INTO v_role
        FROM CUSTOMER
        WHERE id = NEW.assigned_to;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Assigned rider % does not exist', NEW.assigned_to;
        END IF;

        IF v_role <> 'rider' THEN
            RAISE EXCEPTION 'Customer % is not a rider', NEW.assigned_to;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_delivery_assignment_rider
ON SHOP_ORDER_DELIVERY_ASSIGNMENT;
CREATE TRIGGER trg_validate_delivery_assignment_rider
BEFORE INSERT OR UPDATE OF assigned_to
ON SHOP_ORDER_DELIVERY_ASSIGNMENT
FOR EACH ROW
EXECUTE FUNCTION validate_delivery_assignment_rider();


-- ============================================================
-- 8. NEARBY AVAILABLE RIDERS FUNCTION
--
-- Matches the current controller behavior:
--   * role = rider
--   * within 1 km by default
--   * no active SHOP_ORDER
--   * no active assigned delivery
--   * ordered by distance
--
-- The current application does not require isonline in this query,
-- so the function intentionally does not add that extra filter.
-- ============================================================

CREATE OR REPLACE FUNCTION get_nearby_available_riders(
    p_restaurant_id INTEGER,
    p_radius_meters DOUBLE PRECISION DEFAULT 1000
)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    email VARCHAR,
    contact_no VARCHAR,
    latitude NUMERIC,
    longitude NUMERIC,
    distance_from_restaurant DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.latitude,
        c.longitude,
        ST_Distance(
            c.location,
            ST_SetSRID(
                ST_MakePoint(r.longitude, r.latitude),
                4326
            )::geography
        ) AS distance_from_restaurant
    FROM CUSTOMER c
    CROSS JOIN RESTAURANT r
    WHERE r.id = p_restaurant_id
      AND c.role = 'rider'
      AND r.latitude IS NOT NULL
      AND r.longitude IS NOT NULL
      AND ST_DWithin(
          c.location,
          ST_SetSRID(
              ST_MakePoint(r.longitude, r.latitude),
              4326
          )::geography,
          p_radius_meters
      )
      AND NOT EXISTS (
          SELECT 1
          FROM SHOP_ORDER active_so
          WHERE active_so.assigned_rider_id = c.id
            AND active_so.status NOT IN ('delivered', 'cancelled')
      )
      AND NOT EXISTS (
          SELECT 1
          FROM SHOP_ORDER_DELIVERY_ASSIGNMENT active_da
          WHERE active_da.assigned_to = c.id
            AND active_da.assignment_status = 'assigned'
      )
    ORDER BY distance_from_restaurant ASC;
$$;


-- ============================================================
-- 9. ITEM SALES FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_item_total_sold(p_item_id INTEGER)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(SUM(oi.quantity), 0)::INTEGER
    FROM ORDER_ITEM oi
    JOIN SHOP_ORDER so ON so.id = oi.shop_order_id
    WHERE oi.item_id = p_item_id
      AND so.status = 'delivered';
$$;


-- ============================================================
-- 10. RESTAURANT DELIVERY STATISTICS
-- ============================================================

CREATE OR REPLACE FUNCTION get_restaurant_delivery_statistics(
    p_restaurant_id INTEGER
)
RETURNS TABLE (
    total_shop_orders BIGINT,
    delivered_orders BIGINT,
    cancelled_orders BIGINT,
    delivered_revenue NUMERIC,
    average_delivered_order_value NUMERIC
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'delivered'),
        COUNT(*) FILTER (WHERE status = 'cancelled'),
        COALESCE(SUM(subtotal) FILTER (WHERE status = 'delivered'), 0),
        ROUND(
            COALESCE(
                AVG(subtotal) FILTER (WHERE status = 'delivered'),
                0
            ),
            2
        )
    FROM SHOP_ORDER
    WHERE restaurant_id = p_restaurant_id;
$$;


-- ============================================================
-- 11. RIDER DELIVERY STATISTICS
-- ============================================================

CREATE OR REPLACE FUNCTION get_rider_delivery_statistics(
    p_rider_id INTEGER
)
RETURNS TABLE (
    completed_deliveries BIGINT,
    active_deliveries BIGINT,
    delivered_order_value NUMERIC,
    average_delivered_order_value NUMERIC
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        COUNT(*) FILTER (WHERE status = 'delivered'),
        COUNT(*) FILTER (WHERE status NOT IN ('delivered', 'cancelled')),
        COALESCE(SUM(subtotal) FILTER (WHERE status = 'delivered'), 0),
        ROUND(
            COALESCE(
                AVG(subtotal) FILTER (WHERE status = 'delivered'),
                0
            ),
            2
        )
    FROM SHOP_ORDER
    WHERE assigned_rider_id = p_rider_id;
$$;


-- ============================================================
-- 12. TRANSACTIONAL DELIVERY COMPLETION PROCEDURE
--
-- The Node.js controller remains responsible for bcrypt OTP
-- verification. Once verified, this procedure atomically:
--   1. validates the rider/order relationship;
--   2. completes the delivery assignment;
--   3. marks SHOP_ORDER delivered;
--   4. creates the customer notification.
--
-- The status trigger automatically records the delivered transition.
-- ============================================================

CREATE OR REPLACE PROCEDURE complete_delivery(
    IN p_shop_order_id INTEGER,
    IN p_rider_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_assigned_rider_id INTEGER;
    v_order_status order_status_enum;
    v_customer_id INTEGER;
    v_assignment_id INTEGER;
BEGIN
    SELECT
        so.assigned_rider_id,
        so.status,
        fo.customer_id
    INTO
        v_assigned_rider_id,
        v_order_status,
        v_customer_id
    FROM SHOP_ORDER so
    JOIN FOOD_ORDER fo
      ON fo.id = so.order_id
    WHERE so.id = p_shop_order_id
    FOR UPDATE OF so;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Shop order % does not exist', p_shop_order_id;
    END IF;

    IF v_assigned_rider_id IS DISTINCT FROM p_rider_id THEN
        RAISE EXCEPTION 'Delivery is not assigned to this rider';
    END IF;

    IF v_order_status <> 'out_for_delivery' THEN
        RAISE EXCEPTION 'Only an out-for-delivery order can be completed';
    END IF;

    UPDATE SHOP_ORDER_DELIVERY_ASSIGNMENT
    SET assignment_status = 'completed'
    WHERE shop_order_id = p_shop_order_id
      AND assigned_to = p_rider_id
      AND assignment_status = 'assigned'
    RETURNING id INTO v_assignment_id;

    IF v_assignment_id IS NULL THEN
        RAISE EXCEPTION 'Active delivery assignment was not found';
    END IF;

    UPDATE SHOP_ORDER
    SET status = 'delivered'
    WHERE id = p_shop_order_id;

    INSERT INTO NOTIFICATION
    (
        recipient_role,
        recipient_id,
        type,
        title,
        message,
        reference_id
    )
    VALUES
    (
        'customer',
        v_customer_id,
        'delivery_completed',
        'Order delivered',
        'Your order has been delivered successfully.',
        p_shop_order_id
    );
END;
$$;


-- ============================================================
-- 13. CONCURRENCY INDEXES USED BY RIDER ASSIGNMENT
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_delivery_assignment_per_shop_order
ON SHOP_ORDER_DELIVERY_ASSIGNMENT (shop_order_id)
WHERE assignment_status IN ('broadcasted', 'assigned');

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_delivery_assignment_per_rider
ON SHOP_ORDER_DELIVERY_ASSIGNMENT (assigned_to)
WHERE assigned_to IS NOT NULL
  AND assignment_status = 'assigned';

CREATE INDEX IF NOT EXISTS idx_shop_order_active_rider
ON SHOP_ORDER (assigned_rider_id)
WHERE assigned_rider_id IS NOT NULL
  AND status NOT IN ('delivered', 'cancelled');

CREATE INDEX IF NOT EXISTS idx_delivery_assignment_active_rider
ON SHOP_ORDER_DELIVERY_ASSIGNMENT (assigned_to)
WHERE assigned_to IS NOT NULL
  AND assignment_status = 'assigned';

-- ============================================================
--  VALIDATE GMAIL IN DATABASE LEVEL TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION validate_gmail()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.email !~* '^[A-Za-z0-9._%+-]+@gmail\.com$' THEN
        RAISE EXCEPTION 'Email must be a valid Gmail address';
    END IF;

    RETURN NEW;
END;
$$;



CREATE OR REPLACE TRIGGER trg_validate_gmail
BEFORE INSERT 
ON CUSTOMER
FOR EACH ROW
EXECUTE FUNCTION validate_gmail();





CREATE OR REPLACE FUNCTION log_table_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    affected_id INTEGER;
    action_text TEXT;
BEGIN

    IF TG_OP = 'DELETE' THEN
        affected_id := OLD.id;
        action_text := 'deleted';

    ELSIF TG_OP = 'INSERT' THEN
        affected_id := NEW.id;
        action_text := 'inserted';

    ELSE
        affected_id := NEW.id;
        action_text := 'updated';
    END IF;

    INSERT INTO AUDIT_LOG (
        table_name,
        operation,
        record_id,
        description
    )
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        affected_id,
        TG_TABLE_NAME ||
        ' record ' ||
        affected_id ||
        ' was ' ||
        action_text
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;



CREATE TRIGGER trg_audit_customer
AFTER INSERT OR UPDATE OR DELETE ON CUSTOMER
FOR EACH ROW
EXECUTE FUNCTION log_table_change();

CREATE TRIGGER trg_audit_restaurant
AFTER INSERT OR UPDATE OR DELETE ON RESTAURANT
FOR EACH ROW
EXECUTE FUNCTION log_table_change();

CREATE TRIGGER trg_audit_item
AFTER INSERT OR UPDATE OR DELETE ON ITEM
FOR EACH ROW
EXECUTE FUNCTION log_table_change();

CREATE TRIGGER trg_audit_food_order
AFTER INSERT OR UPDATE OR DELETE ON FOOD_ORDER
FOR EACH ROW
EXECUTE FUNCTION log_table_change();

CREATE TRIGGER trg_audit_shop_order
AFTER INSERT OR UPDATE OR DELETE ON SHOP_ORDER
FOR EACH ROW
EXECUTE FUNCTION log_table_change();

CREATE TRIGGER trg_audit_order_item
AFTER INSERT OR UPDATE OR DELETE ON ORDER_ITEM
FOR EACH ROW
EXECUTE FUNCTION log_table_change();

CREATE TRIGGER trg_audit_payment
AFTER INSERT OR UPDATE OR DELETE ON PAYMENT
FOR EACH ROW
EXECUTE FUNCTION log_table_change();

CREATE TRIGGER trg_audit_review
AFTER INSERT OR UPDATE OR DELETE ON REVIEW
FOR EACH ROW
EXECUTE FUNCTION log_table_change();

CREATE TRIGGER trg_audit_issue
AFTER INSERT OR UPDATE OR DELETE ON ISSUES
FOR EACH ROW
EXECUTE FUNCTION log_table_change();


-- End of KhaiDai database business logic migration.
