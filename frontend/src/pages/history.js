import React, { useState, useEffect } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const History = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch order history. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrderHistory();
    }
  }, [isAuthenticated, authLoading]);

  if (loading || authLoading) {
    return (
      <CustomerLayout>
        <div className="text-center">Loading order history...</div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="text-center text-red-500">{error}</div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-3xl font-bold text-white mb-8">Purchase History</h1>
        {orders.length === 0 ? (
          <p className="text-gray-400">You have no past orders.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-lg p-6 shadow-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Order #{order.id}</h2>
                    <p className="text-gray-400 text-sm">
                      {new Date(order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      KES {parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        order.payment_status === 'paid'
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-black'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-300 mb-2">Items:</h3>
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex items-center justify-between text-gray-400">
                        <div className="flex items-center">
                          <img src={item.image_url || '/default-drink.svg'} alt={item.name} className="w-10 h-10 rounded-full mr-4 object-cover"/>
                          <div>
                            <p className="font-medium text-gray-200">{item.name}</p>
                            <p className="text-sm">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm">
                          @ KES {parseFloat(item.price_at_order).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </CustomerLayout>
  );
};

export default History;
