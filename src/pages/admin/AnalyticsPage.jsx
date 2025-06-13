import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Coffee,
  Star,
  Clock,
  Target,
  Award,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Eye,
  Package,
  Truck,
  CreditCard,
  MapPin
} from 'lucide-react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);

  // Mock analytics data
  const mockAnalyticsData = {
    overview: {
      totalRevenue: 45750000,
      revenueGrowth: 15.2,
      totalOrders: 1247,
      ordersGrowth: 12.8,
      totalCustomers: 892,
      customersGrowth: 18.5,
      avgOrderValue: 67000,
      avgOrderGrowth: 8.3,
      conversionRate: 3.2,
      conversionGrowth: 2.1,
      customerRetention: 68.5,
      retentionGrowth: 5.7
    },
    salesTrend: [
      { date: '2024-01-14', revenue: 2100000, orders: 45, customers: 38 },
      { date: '2024-01-15', revenue: 2300000, orders: 52, customers: 44 },
      { date: '2024-01-16', revenue: 2800000, orders: 61, customers: 52 },
      { date: '2024-01-17', revenue: 2200000, orders: 48, customers: 41 },
      { date: '2024-01-18', revenue: 3100000, orders: 68, customers: 58 },
      { date: '2024-01-19', revenue: 3400000, orders: 74, customers: 63 },
      { date: '2024-01-20', revenue: 2900000, orders: 63, customers: 55 }
    ],
    productPerformance: [
      { 
        name: 'Espresso Premium', 
        sales: 234, 
        revenue: 5850000, 
        growth: 18.5,
        margin: 65,
        rating: 4.8,
        reviews: 156
      },
      { 
        name: 'Cappuccino Special', 
        sales: 198, 
        revenue: 6336000, 
        growth: 15.2,
        margin: 62,
        rating: 4.7,
        reviews: 203
      },
      { 
        name: 'Latte Art', 
        sales: 167, 
        revenue: 5845000, 
        growth: 12.8,
        margin: 68,
        rating: 4.9,
        reviews: 89
      },
      { 
        name: 'Americano', 
        sales: 145, 
        revenue: 3190000, 
        growth: 8.5,
        margin: 70,
        rating: 4.5,
        reviews: 134
      },
      { 
        name: 'Iced Coffee Delight', 
        sales: 123, 
        revenue: 3444000, 
        growth: 22.3,
        margin: 58,
        rating: 4.6,
        reviews: 178
      }
    ],
    categoryBreakdown: [
      { name: 'Coffee', value: 68, revenue: 31110000, color: '#8b5cf6' },
      { name: 'Iced Drinks', value: 22, revenue: 10065000, color: '#06b6d4' },
      { name: 'Non Coffee', value: 10, revenue: 4575000, color: '#10b981' }
    ],
    customerSegments: [
      { segment: 'New Customers', count: 245, percentage: 27.5, revenue: 8235000, avgOrder: 33600 },
      { segment: 'Regular Customers', count: 423, percentage: 47.4, revenue: 24570000, avgOrder: 58100 },
      { segment: 'VIP Customers', count: 224, percentage: 25.1, revenue: 12945000, avgOrder: 57800 }
    ],
    hourlyTrends: [
      { hour: '06:00', orders: 12, revenue: 456000 },
      { hour: '07:00', orders: 28, revenue: 1120000 },
      { hour: '08:00', orders: 45, revenue: 1890000 },
      { hour: '09:00', orders: 38, revenue: 1596000 },
      { hour: '10:00', orders: 32, revenue: 1344000 },
      { hour: '11:00', orders: 29, revenue: 1218000 },
      { hour: '12:00', orders: 52, revenue: 2184000 },
      { hour: '13:00', orders: 48, revenue: 2016000 },
      { hour: '14:00', orders: 35, revenue: 1470000 },
      { hour: '15:00', orders: 41, revenue: 1722000 },
      { hour: '16:00', orders: 38, revenue: 1596000 },
      { hour: '17:00', orders: 33, revenue: 1386000 },
      { hour: '18:00', orders: 25, revenue: 1050000 },
      { hour: '19:00', orders: 18, revenue: 756000 },
      { hour: '20:00', orders: 12, revenue: 504000 }
    ],
    paymentMethods: [
      { method: 'QRIS', count: 892, percentage: 71.5, color: '#3b82f6' },
      { method: 'Cash', count: 245, percentage: 19.6, color: '#10b981' },
      { method: 'Card', count: 110, percentage: 8.9, color: '#f59e0b' }
    ],
    deliveryMethods: [
      { method: 'Delivery', count: 748, percentage: 60.0, avgTime: 32, color: '#8b5cf6' },
      { method: 'Pickup', count: 499, percentage: 40.0, avgTime: 15, color: '#06b6d4' }
    ],
    topLocations: [
      { area: 'Jakarta Pusat', orders: 342, revenue: 12540000, growth: 15.2 },
      { area: 'Jakarta Selatan', orders: 298, revenue: 10890000, growth: 12.8 },
      { area: 'Jakarta Barat', orders: 234, revenue: 8560000, growth: 18.5 },
      { area: 'Jakarta Utara', orders: 198, revenue: 7245000, growth: 8.3 },
      { area: 'Jakarta Timur', orders: 175, revenue: 6515000, growth: 22.1 }
    ],
    customerSatisfaction: {
      overall: 4.7,
      breakdown: [
        { rating: 5, count: 456, percentage: 52.1 },
        { rating: 4, count: 298, percentage: 34.0 },
        { rating: 3, count: 89, percentage: 10.2 },
        { rating: 2, count: 23, percentage: 2.6 },
        { rating: 1, count: 10, percentage: 1.1 }
      ]
    }
  };

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

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
      day: 'numeric'
    });
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat data analytics...</p>
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
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">
              Analisis mendalam performa bisnis dan tren penjualan
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Hari Ini</SelectItem>
                <SelectItem value="7d">7 Hari</SelectItem>
                <SelectItem value="30d">30 Hari</SelectItem>
                <SelectItem value="90d">90 Hari</SelectItem>
                <SelectItem value="1y">1 Tahun</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(analyticsData.overview.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analyticsData.overview.revenueGrowth)}
                    <span className={`text-sm ${getGrowthColor(analyticsData.overview.revenueGrowth)}`}>
                      {analyticsData.overview.revenueGrowth > 0 ? '+' : ''}{analyticsData.overview.revenueGrowth}%
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
                  <p className="text-2xl font-bold">{analyticsData.overview.totalOrders}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analyticsData.overview.ordersGrowth)}
                    <span className={`text-sm ${getGrowthColor(analyticsData.overview.ordersGrowth)}`}>
                      {analyticsData.overview.ordersGrowth > 0 ? '+' : ''}{analyticsData.overview.ordersGrowth}%
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
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{analyticsData.overview.totalCustomers}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analyticsData.overview.customersGrowth)}
                    <span className={`text-sm ${getGrowthColor(analyticsData.overview.customersGrowth)}`}>
                      {analyticsData.overview.customersGrowth > 0 ? '+' : ''}{analyticsData.overview.customersGrowth}%
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">{formatPrice(analyticsData.overview.avgOrderValue)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analyticsData.overview.avgOrderGrowth)}
                    <span className={`text-sm ${getGrowthColor(analyticsData.overview.avgOrderGrowth)}`}>
                      {analyticsData.overview.avgOrderGrowth > 0 ? '+' : ''}{analyticsData.overview.avgOrderGrowth}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analyticsData.overview.conversionGrowth)}
                    <span className={`text-sm ${getGrowthColor(analyticsData.overview.conversionGrowth)}`}>
                      {analyticsData.overview.conversionGrowth > 0 ? '+' : ''}{analyticsData.overview.conversionGrowth}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer Retention</p>
                  <p className="text-2xl font-bold">{analyticsData.overview.customerRetention}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getGrowthIcon(analyticsData.overview.retentionGrowth)}
                    <span className={`text-sm ${getGrowthColor(analyticsData.overview.retentionGrowth)}`}>
                      {analyticsData.overview.retentionGrowth > 0 ? '+' : ''}{analyticsData.overview.retentionGrowth}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Award className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Penjualan</CardTitle>
            <CardDescription>Revenue, pesanan, dan pelanggan dalam {timeRange === '7d' ? '7 hari' : timeRange} terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={analyticsData.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatPrice(value) : value,
                    name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Customers'
                  ]}
                  labelFormatter={(value) => formatDate(value)}
                />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#f59e0b" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Breakdown Kategori</CardTitle>
              <CardDescription>Distribusi penjualan berdasarkan kategori produk</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {analyticsData.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{category.value}%</p>
                      <p className="text-muted-foreground">{formatPrice(category.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hourly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Per Jam</CardTitle>
              <CardDescription>Pola pesanan sepanjang hari</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.hourlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatPrice(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Bar dataKey="orders" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performa Produk</CardTitle>
            <CardDescription>Analisis penjualan dan rating produk terlaris</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Produk</th>
                    <th className="text-right py-3 px-4">Penjualan</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    <th className="text-right py-3 px-4">Growth</th>
                    <th className="text-right py-3 px-4">Margin</th>
                    <th className="text-right py-3 px-4">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.productPerformance.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <Coffee className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-medium">{product.sales}</td>
                      <td className="text-right py-3 px-4 font-medium">{formatPrice(product.revenue)}</td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {getGrowthIcon(product.growth)}
                          <span className={`text-sm ${getGrowthColor(product.growth)}`}>
                            {product.growth > 0 ? '+' : ''}{product.growth}%
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={product.margin} className="w-16 h-2" />
                          <span className="text-sm">{product.margin}%</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{product.rating}</span>
                          <span className="text-sm text-muted-foreground">({product.reviews})</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle>Segmen Pelanggan</CardTitle>
              <CardDescription>Distribusi dan kontribusi pelanggan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.customerSegments.map((segment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{segment.segment}</span>
                      <span className="text-sm text-muted-foreground">{segment.percentage}%</span>
                    </div>
                    <Progress value={segment.percentage} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{segment.count} pelanggan</span>
                      <span>{formatPrice(segment.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment & Delivery Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran & Pengiriman</CardTitle>
              <CardDescription>Preferensi pelanggan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Methods */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pembayaran
                </h4>
                <div className="space-y-2">
                  {analyticsData.paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: method.color }}
                        />
                        <span className="text-sm">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{method.percentage}%</p>
                        <p className="text-xs text-muted-foreground">{method.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Delivery Methods */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Pengiriman
                </h4>
                <div className="space-y-2">
                  {analyticsData.deliveryMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: method.color }}
                        />
                        <span className="text-sm">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{method.percentage}%</p>
                        <p className="text-xs text-muted-foreground">{method.avgTime} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Locations & Customer Satisfaction */}
          <div className="space-y-6">
            {/* Top Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Area Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topLocations.slice(0, 3).map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{location.area}</p>
                        <p className="text-xs text-muted-foreground">{location.orders} pesanan</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatPrice(location.revenue)}</p>
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(location.growth)}
                          <span className={`text-xs ${getGrowthColor(location.growth)}`}>
                            {location.growth > 0 ? '+' : ''}{location.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Kepuasan Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold">{analyticsData.customerSatisfaction.overall}</p>
                  <p className="text-sm text-muted-foreground">Rating rata-rata</p>
                </div>
                <div className="space-y-2">
                  {analyticsData.customerSatisfaction.breakdown.map((rating, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm">{rating.rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={rating.percentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {rating.percentage}%
                      </span>
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

export default AnalyticsPage;

