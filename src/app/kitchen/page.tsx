'use client';

import { OrderColumn } from '@/components/kitchen/order-column';
import { useCart } from '@/hooks/use-cart';

export default function KitchenPage() {
  const { kitchenOrders, updateKitchenOrderStatus } = useCart();

  return (
    <div className="grid h-full flex-1 grid-cols-1 gap-4 md:grid-cols-3">
      <OrderColumn
        title="New Orders"
        status="new"
        orders={kitchenOrders.new}
        onMoveOrder={(id) => updateKitchenOrderStatus(id, 'new', 'in-progress')}
        actionText="Start Cooking"
      />
      <OrderColumn
        title="Cooking"
        status="in-progress"
        orders={kitchenOrders['in-progress']}
        onMoveOrder={(id) => updateKitchenOrderStatus(id, 'in-progress', 'completed')}
        actionText="Mark as Done"
      />
      <OrderColumn
        title="Completed"
        status="completed"
        orders={kitchenOrders.completed}
      />
    </div>
  );
}
