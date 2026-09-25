-- Run this file once on an existing database after database.sql has been applied.
-- It is safe to run more than once.

CREATE TABLE IF NOT EXISTS SHOP_ORDER_STATUS_HISTORY (
    id              SERIAL PRIMARY KEY,
    shop_order_id   INTEGER NOT NULL REFERENCES SHOP_ORDER(id) ON DELETE CASCADE,
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
        INSERT INTO SHOP_ORDER_STATUS_HISTORY (shop_order_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$;

-- Keep stored item and restaurant ratings consistent when a review is created.
-- Existing databases may have old reviews, so this new column starts nullable.
-- New reviews always supply it through the API.
ALTER TABLE REVIEW
ADD COLUMN IF NOT EXISTS order_item_id INTEGER REFERENCES ORDER_ITEM(id);

DROP INDEX IF EXISTS uq_review_customer_item;

CREATE UNIQUE INDEX IF NOT EXISTS uq_review_customer_order_item
ON REVIEW (customer_id, order_item_id)
WHERE order_item_id IS NOT NULL;

CREATE OR REPLACE FUNCTION refresh_rating_summaries()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_restaurant_id INTEGER;
BEGIN
    SELECT restaurant_id INTO v_restaurant_id
    FROM ITEM WHERE id = NEW.item_id;

    UPDATE ITEM
    SET rating = (
        SELECT ROUND(AVG(r.rating)::NUMERIC, 2)
        FROM REVIEW r WHERE r.item_id = NEW.item_id
    )
    WHERE id = NEW.item_id;

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
FOR EACH ROW EXECUTE FUNCTION refresh_rating_summaries();

DROP TRIGGER IF EXISTS trg_log_shop_order_status_change ON SHOP_ORDER;
CREATE TRIGGER trg_log_shop_order_status_change
AFTER UPDATE OF status ON SHOP_ORDER
FOR EACH ROW EXECUTE FUNCTION log_shop_order_status_change();

CREATE OR REPLACE FUNCTION get_restaurant_delivery_statistics(p_restaurant_id INTEGER)
RETURNS TABLE (
    total_shop_orders BIGINT,
    delivered_orders BIGINT,
    cancelled_orders BIGINT,
    delivered_revenue NUMERIC,
    average_delivered_order_value NUMERIC
)
LANGUAGE sql STABLE
AS $$
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'delivered'),
        COUNT(*) FILTER (WHERE status = 'cancelled'),
        COALESCE(SUM(subtotal) FILTER (WHERE status = 'delivered'), 0),
        ROUND(COALESCE(AVG(subtotal) FILTER (WHERE status = 'delivered'), 0), 2)
    FROM SHOP_ORDER
    WHERE restaurant_id = p_restaurant_id;
$$;

CREATE OR REPLACE FUNCTION get_rider_delivery_statistics(p_rider_id INTEGER)
RETURNS TABLE (
    completed_deliveries BIGINT,
    active_deliveries BIGINT,
    delivered_order_value NUMERIC,
    average_delivered_order_value NUMERIC
)
LANGUAGE sql STABLE
AS $$
    SELECT
        COUNT(*) FILTER (WHERE status = 'delivered'),
        COUNT(*) FILTER (WHERE status NOT IN ('delivered', 'cancelled')),
        COALESCE(SUM(subtotal) FILTER (WHERE status = 'delivered'), 0),
        ROUND(COALESCE(AVG(subtotal) FILTER (WHERE status = 'delivered'), 0), 2)
    FROM SHOP_ORDER
    WHERE assigned_rider_id = p_rider_id;
$$;

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
    SELECT so.assigned_rider_id, so.status, fo.customer_id
    INTO v_assigned_rider_id, v_order_status, v_customer_id
    FROM SHOP_ORDER so
    JOIN FOOD_ORDER fo ON fo.id = so.order_id
    WHERE so.id = p_shop_order_id
    FOR UPDATE OF so;

    IF NOT FOUND THEN RAISE EXCEPTION 'Shop order % does not exist', p_shop_order_id; END IF;
    IF v_assigned_rider_id IS DISTINCT FROM p_rider_id THEN RAISE EXCEPTION 'This delivery is not assigned to rider %', p_rider_id; END IF;
    IF v_order_status <> 'out_for_delivery' THEN RAISE EXCEPTION 'Only an out-for-delivery order can be completed'; END IF;

    UPDATE SHOP_ORDER_DELIVERY_ASSIGNMENT
    SET assignment_status = 'completed'
    WHERE shop_order_id = p_shop_order_id AND assigned_to = p_rider_id AND assignment_status = 'assigned'
    RETURNING id INTO v_assignment_id;

    IF v_assignment_id IS NULL THEN RAISE EXCEPTION 'Active delivery assignment was not found'; END IF;

    UPDATE SHOP_ORDER SET status = 'delivered', updated_at = CURRENT_TIMESTAMP WHERE id = p_shop_order_id;

    INSERT INTO NOTIFICATION (recipient_role, recipient_id, type, title, message, reference_id)
    VALUES ('customer', v_customer_id, 'delivery_completed', 'Order delivered',
        'Your order has been delivered successfully.', p_shop_order_id);
END;
$$;
