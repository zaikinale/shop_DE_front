import { simulateRequest, getDataset } from './index'

const withOrderTotal = (order) => ({
    ...order,
    total_price: order.items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
    ),
});

export const getOrders = async ({ userId } = {}, variant) => {
    let orders = getDataset(variant).orders;

    if (userId) {
        orders = orders.filter((o) => o.user_id === Number(userId));
    }

    return simulateRequest(orders.map(withOrderTotal));
};

export const getOrderById = async (id, variant) => {
    const order = getDataset(variant).orders.find((o) => o.id === Number(id));
    return simulateRequest(order ? withOrderTotal(order) : null);
};