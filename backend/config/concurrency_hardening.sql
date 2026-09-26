
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
