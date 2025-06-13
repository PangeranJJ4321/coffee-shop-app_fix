import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  LineChart,
  Line,
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Mock dashboard data
  const mockDashboardData = {
    overview: {
      totalRevenue: 15750000,
      revenueGrowth: 12.5,
      totalOrders: 342,
      ordersGrowth: 8.3,
      totalUsers: 1247,
      usersGrowth: 15.2,
      totalMenuItems: 24,
      menuGrowth: 4.2
    },
    recentOrders: [
      {
        id: 'ORD-001',
        customerName: 'John Doe',
        items: 3,
        total: 85000,
        status: 'COMPLETED',
        createdAt: '2024-01-20T14:30:00Z'
      },
      {
        id: 'ORD-002',
        customerName: 'Sarah Wilson',
        items: 2,
        total: 65000,
        status: 'PREPARING',
        createdAt: '2024-01-20T14:15:00Z'
      },
      {
        id: 'ORD-003',
        customerName: 'Mike Johnson',
        items: 1,
        total: 32000,
        status: 'PENDING',
        createdAt: '2024-01-20T14:00:00Z'
      },
      {
        id: 'ORD-004',
        customerName: 'Emma Davis',
        items: 4,
        total: 120000,
        status: 'DELIVERED',
        createdAt: '2024-01-20T13:45:00Z'
      },
      {
        id: 'ORD-005',
        customerName: 'Alex Brown',
        items: 2,
        total: 58000,
        status: 'CANCELLED',
        createdAt: '2024-01-20T13:30:00Z'
      }
    ],
    salesChart: [
      { name: 'Sen', revenue: 2100000, orders: 45 },
      { name: 'Sel', revenue: 2300000, orders: 52 },
      { name: 'Rab', revenue: 2800000, orders: 61 },
      { name: 'Kam', revenue: 2200000, orders: 48 },
      { name: 'Jum', revenue: 3100000, orders: 68 },
      { name: 'Sab', revenue: 3400000, orders: 74 },
      { name: 'Min', revenue: 2900000, orders: 63 }
    ],
    topProducts: [
      { name: 'Espresso Premium', sales: 156, revenue: 3900000, growth: 15.2 },
      { name: 'Cappuccino Special', sales: 134, revenue: 4288000, growth: 12.8 },
      { name: 'Latte Art', sales: 98, revenue: 3430000, growth: 8.5 },
      { name: 'Americano', sales: 87, revenue: 1914000, growth: 5.2 },
      { name: 'Iced Coffee Delight', sales: 76, revenue: 2128000, growth: 18.7 }
    ],
    orderStatus: [
      { name: 'Completed', value: 68, color: '#22c55e' },
      { name: 'Preparing', value: 15, color: '#f59e0b' },
      { name: 'Pending', value: 12, color: '#3b82f6' },
      { name: 'Cancelled', value: 5, color: '#ef4444' }
    ],
    alerts: [
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
        message: '3 pesanan menunggu konfirmasi pembayaran',
        time: '25 menit yang lalu'
      },
      {
        id: 3,
        type: 'success',
        title: 'Target Tercapai',
        message: 'Target penjualan harian tercapai 105%',
        time: '1 jam yang lalu'
      }
    ],
    quickStats: {
      avgOrderValue: 75000,
      avgOrderValueGrowth: 6.8,
      customerSatisfaction: 4.7,
      satisfactionGrowth: 2.1,
      deliveryTime: 28,
      deliveryTimeChange: -3.2,
      returnRate: 2.1,
      returnRateChange: -0.8
    }
  };

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { label: 'Menunggu', color: 'bg-blue-100 text-blue-800' },
      'PREPARING': { label: 'Diproses', color: 'bg-yellow-100 text-yellow-800' },
      'COMPLETED': { label: 'Selesai', color: 'bg-green-100 text-green-800' },
      'DELIVERED': { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
      'CANCELLED': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig['PENDING'];
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
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
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(dashboardData.overview.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(dashboardData.overview.revenueGrowth)}
                    <span className={`text-sm ${getGrowthColor(dashboardData.overview.revenueGrowth)}`}>
                      {dashboardData.overview.revenueGrowth > 0 ? '+' : ''}{dashboardData.overview.revenueGrowth}%
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
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{dashboardData.overview.totalOrders}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(dashboardData.overview.ordersGrowth)}
                    <span className={`text-sm ${getGrowthColor(dashboardData.overview.ordersGrowth)}`}>
                      {dashboardData.overview.ordersGrowth > 0 ? '+' : ''}{dashboardData.overview.ordersGrowth}%
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
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{dashboardData.overview.totalUsers}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(dashboardData.overview.usersGrowth)}
                    <span className={`text-sm ${getGrowthColor(dashboardData.overview.usersGrowth)}`}>
                      {dashboardData.overview.usersGrowth > 0 ? '+' : ''}{dashboardData.overview.usersGrowth}%
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
                  <p className="text-sm font-medium text-muted-foreground">Menu Items</p>
                  <p className="text-2xl font-bold">{dashboardData.overview.totalMenuItems}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(dashboardData.overview.menuGrowth)}
                    <span className={`text-sm ${getGrowthColor(dashboardData.overview.menuGrowth)}`}>
                      {dashboardData.overview.menuGrowth > 0 ? '+' : ''}{dashboardData.overview.menuGrowth}%
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
                <BarChart data={dashboardData.salesChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatPrice(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="revenue" />
                  <Bar yAxisId="right" dataKey="orders" fill="#10b981" name="orders" />
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
                    data={dashboardData.orderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardData.orderStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {dashboardData.orderStatus.map((status, index) => (
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
                  <p className="text-lg font-bold">{formatPrice(dashboardData.quickStats.avgOrderValue)}</p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(dashboardData.quickStats.avgOrderValueGrowth)}
                    <span className={`text-xs ${getGrowthColor(dashboardData.quickStats.avgOrderValueGrowth)}`}>
                      {dashboardData.quickStats.avgOrderValueGrowth > 0 ? '+' : ''}{dashboardData.quickStats.avgOrderValueGrowth}%
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
                  <p className="text-lg font-bold">{dashboardData.quickStats.customerSatisfaction}/5.0</p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(dashboardData.quickStats.satisfactionGrowth)}
                    <span className={`text-xs ${getGrowthColor(dashboardData.quickStats.satisfactionGrowth)}`}>
                      {dashboardData.quickStats.satisfactionGrowth > 0 ? '+' : ''}{dashboardData.quickStats.satisfactionGrowth}%
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
                  <p className="text-sm text-muted-foreground">Waktu Pengiriman</p>
                  <p className="text-lg font-bold">{dashboardData.quickStats.deliveryTime} menit</p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(dashboardData.quickStats.deliveryTimeChange)}
                    <span className={`text-xs ${getGrowthColor(dashboardData.quickStats.deliveryTimeChange)}`}>
                      {dashboardData.quickStats.deliveryTimeChange > 0 ? '+' : ''}{dashboardData.quickStats.deliveryTimeChange} menit
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
                  <p className="text-sm text-muted-foreground">Tingkat Return</p>
                  <p className="text-lg font-bold">{dashboardData.quickStats.returnRate}%</p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(dashboardData.quickStats.returnRateChange)}
                    <span className={`text-xs ${getGrowthColor(dashboardData.quickStats.returnRateChange)}`}>
                      {dashboardData.quickStats.returnRateChange > 0 ? '+' : ''}{dashboardData.quickStats.returnRateChange}%
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
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Lihat Semua
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{order.items} item</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Top Products */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.alerts.map((alert) => (
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
                  {dashboardData.topProducts.slice(0, 3).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} terjual</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatPrice(product.revenue)}</p>
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(product.growth)}
                          <span className={`text-xs ${getGrowthColor(product.growth)}`}>
                            {product.growth > 0 ? '+' : ''}{product.growth}%
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

