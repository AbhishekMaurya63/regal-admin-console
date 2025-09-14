import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderTree, Package, MessageSquare, TrendingUp, Activity, Loader } from "lucide-react";
import { getDataHandlerWithToken } from '@/config/services';

// API endpoints
const API_ENDPOINTS = {
  users: '/api/users',
  categories: '/api/categories',
  products: '/api/products',
  queries: '/api/queries',
  analytics: '/api/analytics/reports'
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalProducts: 0,
    pendingQueries: 0,
    dailyAvgVisitors: 0,
    weeklyAvgVisitors: 0,
    monthlyAvgVisitors: 0,
    dailyUniqVisitors: 0,
    weeklyUniqVisitors: 0,
    monthlyUniqVisitors: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [
        usersResponse,
        categoriesResponse,
        productsResponse,
        queriesResponse,
        avgVisitorResponse,
        uniqVisitorResponse
      ] = await Promise.allSettled([
        getDataHandlerWithToken("getUsers"),
        getDataHandlerWithToken("category"),
        getDataHandlerWithToken("product"),
        getDataHandlerWithToken('query'),
        getDataHandlerWithToken(`analysis`,{"type":"avg-visitor"}),
        getDataHandlerWithToken(`analysis`,{"type":"uniq-visitor"})
      ]);

      // Handle responses
      const users = usersResponse.status === 'fulfilled' ? usersResponse.value : [];
      const categories = categoriesResponse.status === 'fulfilled' ? categoriesResponse.value : [];
      const products = productsResponse.status === 'fulfilled' ? productsResponse.value : [];
      const queries = queriesResponse.status === 'fulfilled' ? queriesResponse.value : [];
      const avgVisitors = avgVisitorResponse.status === 'fulfilled' ? avgVisitorResponse.value : {};
      const uniqVisitors = uniqVisitorResponse.status === 'fulfilled' ? uniqVisitorResponse.value : {};

      // Update stats
      setStats({
        totalUsers: users.length || 0,
        totalCategories: categories.length || 0,
        totalProducts: products.length || 0,
        pendingQueries: queries.filter(q => q.status === 'pending').length || 0,
        dailyAvgVisitors: avgVisitors.dailyAvg || 0,
        weeklyAvgVisitors: avgVisitors.weeklyAvg || 0,
        monthlyAvgVisitors: avgVisitors.monthlyAvg || 0,
        dailyUniqVisitors: uniqVisitors.dailyAvg || 0,
        weeklyUniqVisitors: uniqVisitors.weeklyAvg || 0,
        monthlyUniqVisitors: uniqVisitors.monthlyAvg || 0
      });

      // Generate recent activities from the fetched data
      const activities = [];
      
      // Add recent user registrations
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2);
      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user._id}`,
          type: "user",
          message: `New user ${user.name} registered`,
          time: formatTimeAgo(user.createdAt)
        });
      });

      // Add recent product updates
      const recentProducts = products
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 2);
      recentProducts.forEach(product => {
        activities.push({
          id: `product-${product._id}`,
          type: "product",
          message: `Product '${product.name}' was updated`,
          time: formatTimeAgo(product.updatedAt)
        });
      });

      // Add pending queries
      const recentQueries = queries
        .filter(q => q.status === 'pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2);
      recentQueries.forEach(query => {
        activities.push({
          id: `query-${query._id}`,
          type: "query",
          message: `New support query from ${query.name}`,
          time: formatTimeAgo(query.createdAt)
        });
      });

      // Sort activities by time
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 4));

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };

  const statsData = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12%", // This would ideally come from analytics API
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Categories",
      value: stats.totalCategories.toLocaleString(),
      change: "+3", // This would ideally come from analytics API
      changeType: "positive",
      icon: FolderTree,
    },
    {
      title: "Products",
      value: stats.totalProducts.toLocaleString(),
      change: "+8%", // This would ideally come from analytics API
      changeType: "positive",
      icon: Package,
    },
    {
      title: "Pending Queries",
      value: stats.pendingQueries.toLocaleString(),
      change: "-4", // This would ideally come from analytics API
      changeType: stats.pendingQueries > 0 ? "negative" : "positive",
      icon: MessageSquare,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your admin panel.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Analytics Overview */}
       <Card className="col-span-4 border border-gray-200 shadow-sm">
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
      <TrendingUp className="h-5 w-5" />
      Analytics Overview
    </CardTitle>
    <CardDescription className="text-gray-600">
      Visitor metrics for your website
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Average Visitors Card */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Average Visitors</h3>
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-gray-700" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Daily:</span>
            <span className="font-bold text-lg text-gray-900">{stats.dailyAvgVisitors}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Weekly:</span>
            <span className="font-bold text-lg text-gray-900">{stats.weeklyAvgVisitors}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Monthly:</span>
            <span className="font-bold text-lg text-gray-900">{stats.monthlyAvgVisitors}</span>
          </div>
        </div>
      </div>
      
      {/* Unique Visitors Card */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Unique Visitors</h3>
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Activity className="h-4 w-4 text-gray-700" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Daily:</span>
            <span className="font-bold text-lg text-gray-900">{stats.dailyUniqVisitors}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Weekly:</span>
            <span className="font-bold text-lg text-gray-900">{stats.weeklyUniqVisitors}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Monthly:</span>
            <span className="font-bold text-lg text-gray-900">{stats.monthlyUniqVisitors}</span>
          </div>
        </div>
      </div>
    </div>
    
    {/* Insights Card */}
    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-gray-700" />
        </div>
        <h3 className="font-semibold text-gray-900">Visitor Insights</h3>
      </div>
      <p className="text-gray-700">
        {stats.dailyAvgVisitors > stats.dailyUniqVisitors 
          ? `Your site has ${stats.dailyAvgVisitors - stats.dailyUniqVisitors} returning visitors on average.`
          : 'All your daily visitors are unique.'}
      </p>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {stats.dailyAvgVisitors > 0 && stats.dailyUniqVisitors > 0 && 
            `Return rate: ${(((stats.dailyAvgVisitors - stats.dailyUniqVisitors) / stats.dailyUniqVisitors) * 100).toFixed(1)}%`}
        </p>
      </div>
    </div>
  </CardContent>
</Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest actions in your admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className={`rounded-full p-2 ${
                      activity.type === 'user' ? 'bg-green-100' : 
                      activity.type === 'product' ? 'bg-blue-100' : 
                      'bg-amber-100'
                    }`}>
                      {activity.type === 'user' && <Users className="h-4 w-4 text-green-600" />}
                      {activity.type === 'product' && <Package className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'query' && <MessageSquare className="h-4 w-4 text-amber-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;