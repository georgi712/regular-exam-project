import { useEffect, useState } from "react";
import { useGetAllOrders } from "../../../api/ordersApi.js";
import { useAllProducts } from "../../../api/productApi.js";

const Dashboard = () => {
  const { orders } = useGetAllOrders();
  const { products } = useAllProducts();

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    setTotalProducts(products.length)
    setTotalOrders(orders.length)
    setTotalRevenue(orders?.reduce((acc, order) => acc + order.pricing.total, 0))
  }, [orders, products])

  const metrics = {
    totalOrders,
    totalRevenue,
    totalProducts,
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-normal text-base-content/70">Total Orders</h3>
                <p className="text-3xl font-bold">{metrics.totalOrders}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-normal text-base-content/70">Revenue</h3>
                <p className="text-3xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-normal text-base-content/70">Products</h3>
                <p className="text-3xl font-bold">{metrics.totalProducts}</p>
              </div>
              <div className="rounded-full bg-info/10 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 