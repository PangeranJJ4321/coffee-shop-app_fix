import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  Coffee,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Activity,
  Target,
  Award,
  Zap
} from 'lucide-react';


// Order status configurations
const ORDER_STATUSES_CONFIG = {
  'PENDING': {
    label: 'Menunggu Pembayaran',
    color: 'bg-yellow-100 text-yellow-800',
    chartColor: '#eab308' // yellow-500
  },
  'PROCESSING': {
    label: 'Diproses Pembayaran',
    color: 'bg-blue-100 text-blue-800',
    chartColor: '#3b82f6' // blue-500
  },
  'CONFIRMED': {
    label: 'Dikonfirmasi',
    color: 'bg-indigo-100 text-indigo-800',
    chartColor: '#6366f1' // indigo-500
  },
  'PREPARING': {
    label: 'Disiapkan',
    color: 'bg-orange-100 text-orange-800',
    chartColor: '#f97316' // orange-500
  },
  'READY': {
    label: 'Siap',
    color: 'bg-purple-100 text-purple-800',
    chartColor: '#a855f7' // purple-500
  },
  'DELIVERED': {
    label: 'Dikirim',
    color: 'bg-teal-100 text-teal-800',
    chartColor: '#14b8a6' // teal-500
  },
  'COMPLETED': {
    label: 'Selesai',
    color: 'bg-green-100 text-green-800',
    chartColor: '#22c55e' // green-500
  },
  'CANCELLED': {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-800',
    chartColor: '#ef4444' // red-500
  }
};

// Statuses for filtering (juga dipindahkan keluar atau disesuaikan jika perlu)
const STATUSES_FILTER_CONFIG = [
  { value: 'ACTIVE', label: 'Aktif', color: 'bg-green-100 text-green-800' },
  { value: 'INACTIVE', label: 'Tidak Aktif', color: 'bg-red-100 text-red-800' }
];

// Utility functions (tidak lagi useCallback karena tidak di dalam komponen)
const getStatusBadge = (status) => {
  const config = ORDER_STATUSES_CONFIG[status];
  return (
    <Badge className={`${config?.color || 'bg-gray-100 text-gray-800'} border-0`}>
      {config?.label || status}
    </Badge>
  );
};

const getGrowthIcon = (growth) => {
  if (growth > 0) {
    return <TrendingUp className="h-4 w-4 text-green-600" />;
  } else if (growth < 0) {
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  }
  return null;
};

const getGrowthColor = (growth) => {
  if (growth > 0) return 'text-green-600';
  if (growth < 0) return 'text-red-600';
  return 'text-gray-600';
};

const getAlertIcon = (type) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Activity className="h-4 w-4 text-blue-600" />;
  }
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [quickStatsData, setQuickStatsData] = useState(null);
  const [dashboardError, setDashboardError] = useState('');

  // Fungsi formatPrice dan formatDate tetap di dalam komponen jika Anda mau
  // atau pindahkan keluar jika mereka benar-benar statis dan tidak bergantung pada closure komponen.
  const formatPrice = useCallback((price) => {
    if (typeof price !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('id-ID', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString;
    }
  }, []);

  // --- Fetch All Dashboard Data from Backend ---
  const fetchAllDashboardData = useCallback(async () => {
    setIsLoading(true);
    setDashboardError('');
    try {
      // 1. Fetch Dashboard Summary (Overview Cards)
      const summaryResponse = await api.get('/admin/analytics/dashboard/summary');
      setDashboardSummary(summaryResponse.data);
      console.log("Dashboard Summary:", summaryResponse.data);

      const totalRevenueMonth = summaryResponse.data.total_revenue_this_month;
      const totalOrdersMonth = summaryResponse.data.total_orders_this_month;
      const monthlyAOV = totalOrdersMonth > 0 ? (totalRevenueMonth / totalOrdersMonth) : 0;

      // 2. Fetch Recent Orders (last 5 orders)
      const recentOrdersResponse = await api.get('/admin/order-management/orders?limit=5&sort_by=created_at&sort_order=desc');
      setRecentOrders(recentOrdersResponse.data);
      console.log("Recent Orders:", recentOrdersResponse.data);

      // 3. Fetch Sales Chart Data (e.g., last 7 days)
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const salesResponse = await api.get(`/admin/analytics/sales?group_by=day&start_date=${sevenDaysAgo.toISOString().split('T')[0]}&end_date=${today.toISOString().split('T')[0]}`);
      setSalesChartData(salesResponse.data.sales_data);
      console.log("Sales Chart Data:", salesResponse.data.sales_data);

      // 4. Fetch Order Status Data (for Pie Chart)
      const orderAnalyticsResponse = await api.get('/admin/analytics/orders');
      const pieChartData = Object.entries(orderAnalyticsResponse.data.order_status_distribution).map(([status, count]) => {
        const config = ORDER_STATUSES_CONFIG[status.toUpperCase()];
        console.log("Cek config status pie", config);
        return {
          name: config?.label || status,
          value: count,
          color: config?.chartColor || '#6b7280' // gray-500 sebagai fallback
        };
      });
      setOrderStatusData(pieChartData);
      console.log("Order Status Data:", pieChartData);

      // 5. Fetch Top Products
      const popularItemsResponse = await api.get('/admin/analytics/popular-items?limit=5');
      setTopProductsData(popularItemsResponse.data.popular_items);
      console.log("Top Products:", popularItemsResponse.data.popular_items);

      // 6. Fetch Quick Stats (from user analytics and customer behavior)
      const userAnalyticsResponse = await api.get('/admin/analytics/users');
      const customerBehaviorResponse = await api.get('/admin/analytics/customer-behavior');

      setQuickStatsData({
        avgOrderValue: monthlyAOV, 
        avgOrderValueGrowth: 0, 
        customerSatisfaction: 4.7, 
        satisfactionGrowth: 0, 
        deliveryTime: 28, 
        deliveryTimeChange: 0, 
        returnRate: customerBehaviorResponse.data.repeat_customer_rate || 0,
        returnRateChange: 0 
      });
      console.log("User Analytics:", userAnalyticsResponse.data);
      console.log("Customer Behavior:", customerBehaviorResponse.data);


    } catch (error) {
      console.error("Failed to fetch dashboard data:", error.response?.data || error.message);
      setDashboardError(error.response?.data?.detail || 'Gagal memuat data dashboard. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [api]);


  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Activity className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <AlertDescription>{dashboardError}</AlertDescription>
        </Alert>
        <Button onClick={fetchAllDashboardData} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  // Handle case where dashboardSummary or quickStatsData is still null after loading
  if (!dashboardSummary || !quickStatsData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Tidak ada data dashboard yang tersedia. Muat ulang halaman atau coba lagi.</p>
        <Button onClick={fetchAllDashboardData} className="mt-4">Muat Ulang</Button>
      </div>
    );
  }

  console.log("status order :", orderStatusData)

  // Mock alerts (these are not fetched from backend yet)
  const mockAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Stok Rendah',
      message: 'Biji kopi Arabica Premium tersisa 5kg',
      time: '10 menit yang lalu'
    },
    {
      id: 2,
      type: 'info',
      title: 'Pesanan Menunggu',
      message: `${dashboardSummary.pending_orders_count} pesanan menunggu konfirmasi pembayaran`, // Dynamic from summary
      time: 'Update terbaru'
    },
    {
      id: 3,
      type: 'success',
      title: 'Total Revenue Hari Ini',
      message: `Tercapai ${formatPrice(dashboardSummary.total_revenue_today)}`, // Dynamic from summary
      time: 'Update terbaru'
    }
  ];


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground">
              Selamat datang kembali, {user?.name}! Berikut ringkasan bisnis Anda hari ini.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue Bulan Ini</p>
                  <p className="text-2xl font-bold">{formatPrice(dashboardSummary.total_revenue_this_month)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(dashboardSummary.revenue_growth_percentage)}
                    <span className={`text-sm ${getGrowthColor(dashboardSummary.revenue_growth_percentage)}`}>
                      {dashboardSummary.revenue_growth_percentage > 0 ? '+' : ''}{dashboardSummary.revenue_growth_percentage}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pesanan Bulan Ini</p>
                  <p className="text-2xl font-bold">{dashboardSummary.total_orders_this_month}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(dashboardSummary.order_growth_percentage)}
                    <span className={`text-sm ${getGrowthColor(dashboardSummary.order_growth_percentage)}`}>
                      {dashboardSummary.order_growth_percentage > 0 ? '+' : ''}{dashboardSummary.order_growth_percentage}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pengguna Aktif (Bulan Ini)</p>
                  <p className="text-2xl font-bold">{dashboardSummary.active_users_this_month}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {/* Placeholder for real user growth */}
                    {getGrowthIcon(0)}
                    <span className={`text-sm ${getGrowthColor(0)}`}>
                      +0.0%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jumlah Menu Item</p>
                  <p className="text-2xl font-bold">{dashboardSummary.total_menu_items}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {/* growth belum dihitung di backend untuk menu item */}
                    {getGrowthIcon(0)}
                    <span className={`text-sm ${getGrowthColor(0)}`}>
                      +0.0%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Coffee className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Penjualan 7 Hari Terakhir</CardTitle>
              <CardDescription>Revenue dan jumlah pesanan harian</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { weekday: 'short' })}
                  />
                  <YAxis yAxisId="left" tickFormatter={formatPrice} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => {
                      // Perbaikan: gunakan mapping yang tepat berdasarkan dataKey
                      if (name === 'total_sales') {
                        return [formatPrice(value), 'Revenue'];
                      } else if (name === 'order_count') {
                        return [value, 'Orders'];
                      }
                      return [value, name]; // fallback
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  />
                  <Bar yAxisId="left" dataKey="total_sales" fill="#3b82f6" name="total_sales" />
                  <Bar yAxisId="right" dataKey="order_count" fill="#10b981" name="order_count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Status Pesanan</CardTitle>
              <CardDescription>Distribusi status pesanan hari ini</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {orderStatusData.map((status, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.name}</span>
                    </div>
                    <span className="font-medium">{status.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata Nilai Pesanan</p>
                  <p className="text-lg font-bold">{formatPrice(quickStatsData.avgOrderValue)}</p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(quickStatsData.avgOrderValueGrowth)}
                    <span className={`text-xs ${getGrowthColor(quickStatsData.avgOrderValueGrowth)}`}>
                      {quickStatsData.avgOrderValueGrowth > 0 ? '+' : ''}{quickStatsData.avgOrderValueGrowth}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kepuasan Pelanggan</p>
                  <p className="text-lg font-bold">{quickStatsData.customerSatisfaction}/5.0</p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(quickStatsData.satisfactionGrowth)}
                    <span className={`text-xs ${getGrowthColor(quickStatsData.satisfactionGrowth)}`}>
                      {quickStatsData.satisfactionGrowth > 0 ? '+' : ''}{quickStatsData.satisfactionGrowth}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Waktu Pengiriman Rata-rata</p>
                  <p className="text-lg font-bold">{quickStatsData.deliveryTime} menit</p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(quickStatsData.deliveryTimeChange)}
                    <span className={`text-xs ${getGrowthColor(quickStatsData.deliveryTimeChange)}`}>
                      {quickStatsData.deliveryTimeChange > 0 ? '+' : ''}{quickStatsData.deliveryTimeChange} menit
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Award className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tingkat Retensi Pelanggan</p>
                  <p className="text-lg font-bold">{quickStatsData.returnRate}%</p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(quickStatsData.returnRateChange)}
                    <span className={`text-xs ${getGrowthColor(quickStatsData.returnRateChange)}`}>
                      {quickStatsData.returnRateChange > 0 ? '+' : ''}{quickStatsData.returnRateChange}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pesanan Terbaru</CardTitle>
                <CardDescription>5 pesanan terakhir yang masuk</CardDescription>
              </div>
              <Button onClick={() => navigate('/admin/orders')} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Lihat Semua
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">#{order.order_id}</p>
                          <p className="text-sm text-muted-foreground">{order.user_name}</p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{order.items_count} item</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(order.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Top Products */}
          <div className="space-y-6">
            {/* Alerts (menggunakan mock data yang di-dynamic-kan dari summary) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAlerts.map((alert) => ( // Using mockAlerts
                    <Alert key={alert.id}>
                      {getAlertIcon(alert.type)}
                      <AlertDescription>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Produk Terlaris</CardTitle>
                <CardDescription>Berdasarkan penjualan minggu ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProductsData.slice(0, 3).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.coffee_name}</p>
                        <p className="text-xs text-muted-foreground">{product.total_quantity} terjual</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatPrice(product.total_revenue)}</p>
                        {/* Growth for individual products not directly provided in PopularItem schema */}
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(0)}
                          <span className={`text-xs ${getGrowthColor(0)}`}>
                            +0.0%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;