-- Apply this migration to an existing KhaiDai database.
-- It is intentionally non-destructive: it does not drop or recreate tables.

-- A shop order can have at most one active delivery offer. Completed
-- assignments remain available as historical records.
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_delivery_assignment_per_shop_order
ON SHOP_ORDER_DELIVERY_ASSIGNMENT (shop_order_id)
WHERE assignment_status IN ('broadcasted', 'assigned');

-- A rider can have at most one active delivery assignment. This is a final
-- database guard in addition to the advisory lock in acceptShopOrder.
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_delivery_assignment_per_rider
ON SHOP_ORDER_DELIVERY_ASSIGNMENT (assigned_to)
WHERE assigned_to IS NOT NULL
  AND assignment_status = 'assigned';

-- These indexes support the contention-sensitive lookup paths.
CREATE INDEX IF NOT EXISTS idx_shop_order_active_rider
ON SHOP_ORDER (assigned_rider_id)
WHERE assigned_rider_id IS NOT NULL
  AND status NOT IN ('delivered', 'cancelled');

CREATE INDEX IF NOT EXISTS idx_delivery_assignment_active_rider
ON SHOP_ORDER_DELIVERY_ASSIGNMENT (assigned_to)
WHERE assigned_to IS NOT NULL
  AND assignment_status = 'assigned';
