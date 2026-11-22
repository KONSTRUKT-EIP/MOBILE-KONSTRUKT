import api from '../API/Api';
import { Order } from '../Types/Order';

const orderService = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get<{ orders: Order[] }>('/dashboard/armature/orders');
    return response.data.orders ?? [];
  },
};

export default orderService;
