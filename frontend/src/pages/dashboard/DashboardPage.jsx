import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/ApiService';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentOrders from '../../components/dashboard/RecentOrders';
import LowStockAlerts from '../../components/dashboard/LowStockAlerts';
import RecentActivity from '../../components/dashboard/RecentActivity';

const DashboardPage = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error } = useNotifications();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, alertsResponse, activityResponse] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/low-stock-alerts'),
          api.get('/dashboard/recent-activity')
        ]);
        
        setDashboardStats(statsResponse.data);
        setLowStockAlerts(alertsResponse.data);
        setRecentActivity(activityResponse.data);
      } catch (err) {
        error('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Products"
            value={dashboardStats.stats.totalProducts}
            icon="📦"
            color="bg-blue-500"
          />
          <StatsCard
            title="Total Categories"
            value={dashboardStats.stats.totalCategories}
            icon="📂"
            color="bg-green-500"
          />
          <StatsCard
            title="Total Suppliers"
            value={dashboardStats.stats.totalSuppliers}
            icon="🏢"
            color="bg-purple-500"
          />
          <StatsCard
            title="Total Orders"
            value={dashboardStats.stats.totalOrders}
            icon="📋"
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <RecentOrders orders={dashboardStats?.recentOrders || []} />

        {/* Low Stock Alerts */}
        <LowStockAlerts alerts={lowStockAlerts} />

        {/* Recent Activity */}
        <RecentActivity activity={recentActivity} className="lg:col-span-2" />
      </div>
    </div>
  );
};

export default DashboardPage;