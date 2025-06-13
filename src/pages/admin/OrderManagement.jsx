import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Package,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Truck,
  Coffee,
  Star,
  MessageSquare,
  RefreshCw,
  Download,
  FileText,
  CreditCard
} from 'lucide-react';

const OrderManagement = () => {
  const { user: currentUser } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock order data
  const mockOrders = [
    {
      id: 'ORD-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '081234567890',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: 'QRIS',
      total: 85000,
      subtotal: 75000,
      shippingCost: 10000,
      discount: 0,
      promoCode: null,
      deliveryMethod: 'DELIVERY',
      deliveryAddress: 'Jl. Sudirman No. 123, Jakarta Pusat',
      deliveryTime: '2024-01-20T15:00:00Z',
      notes: 'Tolong jangan terlalu manis',
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      items: [
        {
          id: 1,
          name: 'Espresso Premium',
          price: 25000,
          quantity: 2,
          variants: [
            { name: 'Size', option: 'Medium', priceModifier: 5000 },
            { name: 'Sugar Level', option: 'Less Sugar', priceModifier: 0 }
          ]
        },
        {
          id: 2,
          name: 'Cappuccino Special',
          price: 32000,
          quantity: 1,
          variants: [
            { name: 'Size', option: 'Large', priceModifier: 10000 },
            { name: 'Milk Type', option: 'Oat Milk', priceModifier: 8000 }
          ]
        }
      ],
      timeline: [
        { status: 'PENDING', timestamp: '2024-01-20T14:30:00Z', note: 'Pesanan dibuat' },
        { status: 'PAID', timestamp: '2024-01-20T14:35:00Z', note: 'Pembayaran berhasil' },
        { status: 'PREPARING', timestamp: '2024-01-20T14:40:00Z', note: 'Pesanan sedang diproses' },
        { status: 'READY', timestamp: '2024-01-20T15:10:00Z', note: 'Pesanan siap dikirim' },
        { status: 'DELIVERED', timestamp: '2024-01-20T15:30:00Z', note: 'Pesanan telah dikirim' },
        { status: 'COMPLETED', timestamp: '2024-01-20T15:45:00Z', note: 'Pesanan selesai' }
      ]
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      customerPhone: '081234567891',
      status: 'PREPARING',
      paymentStatus: 'PAID',
      paymentMethod: 'QRIS',
      total: 65000,
      subtotal: 55000,
      shippingCost: 10000,
      discount: 0,
      promoCode: null,
      deliveryMethod: 'PICKUP',
      deliveryAddress: null,
      deliveryTime: '2024-01-20T16:00:00Z',
      notes: null,
      createdAt: '2024-01-20T14:15:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      items: [
        {
          id: 3,
          name: 'Latte Art',
          price: 35000,
          quantity: 1,
          variants: [
            { name: 'Size', option: 'Large', priceModifier: 10000 },
            { name: 'Sugar Level', option: 'Normal Sugar', priceModifier: 0 }
          ]
        },
        {
          id: 4,
          name: 'Americano',
          price: 22000,
          quantity: 1,
          variants: [
            { name: 'Size', option: 'Medium', priceModifier: 5000 }
          ]
        }
      ],
      timeline: [
        { status: 'PENDING', timestamp: '2024-01-20T14:15:00Z', note: 'Pesanan dibuat' },
        { status: 'PAID', timestamp: '2024-01-20T14:20:00Z', note: 'Pembayaran berhasil' },
        { status: 'PREPARING', timestamp: '2024-01-20T14:25:00Z', note: 'Pesanan sedang diproses' }
      ]
    },
    {
      id: 'ORD-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '081234567892',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: 'QRIS',
      total: 32000,
      subtotal: 32000,
      shippingCost: 0,
      discount: 5000,
      promoCode: 'WELCOME10',
      deliveryMethod: 'PICKUP',
      deliveryAddress: null,
      deliveryTime: '2024-01-20T17:00:00Z',
      notes: 'Pickup jam 5 sore',
      createdAt: '2024-01-20T14:00:00Z',
      updatedAt: '2024-01-20T14:00:00Z',
      items: [
        {
          id: 5,
          name: 'Iced Coffee Delight',
          price: 28000,
          quantity: 1,
          variants: [
            { name: 'Size', option: 'Large', priceModifier: 10000 },
            { name: 'Sugar Level', option: 'Extra Sugar', priceModifier: 0 }
          ]
        }
      ],
      timeline: [
        { status: 'PENDING', timestamp: '2024-01-20T14:00:00Z', note: 'Pesanan dibuat, menunggu pembayaran' }
      ]
    },
    {
      id: 'ORD-004',
      customerName: 'Emma Davis',
      customerEmail: 'emma@example.com',
      customerPhone: '081234567893',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'QRIS',
      total: 120000,
      subtotal: 110000,
      shippingCost: 10000,
      discount: 0,
      promoCode: null,
      deliveryMethod: 'DELIVERY',
      deliveryAddress: 'Jl. Thamrin No. 456, Jakarta Pusat',
      deliveryTime: '2024-01-20T14:30:00Z',
      notes: null,
      createdAt: '2024-01-20T13:45:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      items: [
        {
          id: 6,
          name: 'Cappuccino Special',
          price: 32000,
          quantity: 2,
          variants: [
            { name: 'Size', option: 'Large', priceModifier: 10000 },
            { name: 'Milk Type', option: 'Almond Milk', priceModifier: 10000 }
          ]
        },
        {
          id: 7,
          name: 'Hot Chocolate',
          price: 30000,
          quantity: 2,
          variants: [
            { name: 'Size', option: 'Medium', priceModifier: 5000 }
          ]
        }
      ],
      timeline: [
        { status: 'PENDING', timestamp: '2024-01-20T13:45:00Z', note: 'Pesanan dibuat' },
        { status: 'PAID', timestamp: '2024-01-20T13:50:00Z', note: 'Pembayaran berhasil' },
        { status: 'PREPARING', timestamp: '2024-01-20T13:55:00Z', note: 'Pesanan sedang diproses' },
        { status: 'READY', timestamp: '2024-01-20T14:20:00Z', note: 'Pesanan siap dikirim' },
        { status: 'DELIVERED', timestamp: '2024-01-20T14:30:00Z', note: 'Pesanan telah dikirim' }
      ]
    },
    {
      id: 'ORD-005',
      customerName: 'Alex Brown',
      customerEmail: 'alex@example.com',
      customerPhone: '081234567894',
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      paymentMethod: 'QRIS',
      total: 58000,
      subtotal: 48000,
      shippingCost: 10000,
      discount: 0,
      promoCode: null,
      deliveryMethod: 'DELIVERY',
      deliveryAddress: 'Jl. Gatot Subroto No. 789, Jakarta Selatan',
      deliveryTime: '2024-01-20T15:00:00Z',
      notes: 'Dibatalkan karena stok habis',
      createdAt: '2024-01-20T13:30:00Z',
      updatedAt: '2024-01-20T13:45:00Z',
      items: [
        {
          id: 8,
          name: 'Green Tea Latte',
          price: 33000,
          quantity: 1,
          variants: [
            { name: 'Size', option: 'Large', priceModifier: 10000 },
            { name: 'Milk Type', option: 'Soy Milk', priceModifier: 6000 }
          ]
        },
        {
          id: 9,
          name: 'Americano',
          price: 22000,
          quantity: 1,
          variants: [
            { name: 'Size', option: 'Small', priceModifier: 0 }
          ]
        }
      ],
      timeline: [
        { status: 'PENDING', timestamp: '2024-01-20T13:30:00Z', note: 'Pesanan dibuat' },
        { status: 'PAID', timestamp: '2024-01-20T13:35:00Z', note: 'Pembayaran berhasil' },
        { status: 'CANCELLED', timestamp: '2024-01-20T13:45:00Z', note: 'Pesanan dibatalkan - stok habis' },
        { status: 'REFUNDED', timestamp: '2024-01-20T13:50:00Z', note: 'Pembayaran dikembalikan' }
      ]
    }
  ];

  const orderStatuses = [
    { value: 'PENDING', label: 'Menunggu Pembayaran', color: 'bg-blue-100 text-blue-800' },
    { value: 'PAID', label: 'Dibayar', color: 'bg-green-100 text-green-800' },
    { value: 'PREPARING', label: 'Diproses', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'READY', label: 'Siap', color: 'bg-purple-100 text-purple-800' },
    { value: 'DELIVERED', label: 'Dikirim', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'COMPLETED', label: 'Selesai', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
  ];

  const paymentStatuses = [
    { value: 'PENDING', label: 'Menunggu', color: 'bg-blue-100 text-blue-800' },
    { value: 'PAID', label: 'Dibayar', color: 'bg-green-100 text-green-800' },
    { value: 'FAILED', label: 'Gagal', color: 'bg-red-100 text-red-800' },
    { value: 'REFUNDED', label: 'Dikembalikan', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by payment status
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'total_high':
          return b.total - a.total;
        case 'total_low':
          return a.total - b.total;
        case 'customer':
          return a.customerName.localeCompare(b.customerName);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter, sortBy]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOrders(prev => prev.map(order =>
        order.id === selectedOrder.id
          ? { 
              ...order, 
              status: newStatus,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...order.timeline,
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  note: statusNote || `Status diubah ke ${getStatusLabel(newStatus)}`
                }
              ]
            }
          : order
      ));

      setIsUpdateStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
      
    } catch (error) {
      alert('Gagal mengupdate status pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetailDialog = (order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const openUpdateStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setIsUpdateStatusDialogOpen(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    if (!statusConfig) return null;
    
    return (
      <Badge className={`${statusConfig.color} border-0`}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = paymentStatuses.find(s => s.value === status);
    if (!statusConfig) return null;
    
    return (
      <Badge className={`${statusConfig.color} border-0`}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getStatusLabel = (status) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    return statusConfig ? statusConfig.label : status;
  };

  const getDeliveryMethodBadge = (method) => {
    const config = {
      'DELIVERY': { label: 'Delivery', color: 'bg-blue-100 text-blue-800', icon: Truck },
      'PICKUP': { label: 'Pickup', color: 'bg-green-100 text-green-800', icon: Package }
    };
    
    const methodConfig = config[method];
    if (!methodConfig) return null;
    
    const Icon = methodConfig.icon;
    return (
      <Badge className={`${methodConfig.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {methodConfig.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat data pesanan...</p>
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
            <h1 className="text-3xl font-bold">Manajemen Pesanan</h1>
            <p className="text-muted-foreground">
              Kelola dan pantau semua pesanan pelanggan
            </p>
          </div>
          <div className="flex gap-2">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Total Pesanan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => ['PENDING', 'PAID', 'PREPARING'].includes(o.status)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Sedang Diproses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'COMPLETED').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Selesai</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatPrice(orders.reduce((total, order) => total + order.total, 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari ID pesanan, nama pelanggan, atau menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Payment Filter */}
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pembayaran</SelectItem>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="total_high">Total Tertinggi</SelectItem>
                  <SelectItem value="total_low">Total Terendah</SelectItem>
                  <SelectItem value="customer">Nama Pelanggan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Menampilkan {filteredOrders.length} dari {orders.length} pesanan
                {searchTerm && ` untuk "${searchTerm}"`}
              </span>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                >
                  Hapus pencarian
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak ada pesanan ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                }}>
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pesanan</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pembayaran</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.id}</p>
                            {getDeliveryMethodBadge(order.deliveryMethod)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.items.length} item</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.slice(0, 2).map(item => item.name).join(', ')}
                              {order.items.length > 2 && ` +${order.items.length - 2} lainnya`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold">{formatPrice(order.total)}</p>
                            {order.discount > 0 && (
                              <p className="text-sm text-green-600">
                                Diskon: -{formatPrice(order.discount)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {order.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(order.createdAt)}</p>
                            {order.deliveryTime && (
                              <p className="text-muted-foreground">
                                Target: {formatDate(order.deliveryTime)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openDetailDialog(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openUpdateStatusDialog(order)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Print Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pesanan {selectedOrder?.id}</DialogTitle>
              <DialogDescription>
                Informasi lengkap pesanan pelanggan
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informasi Pelanggan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nama</Label>
                      <p>{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p>{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Telepon</Label>
                      <p>{selectedOrder.customerPhone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Metode Pengiriman</Label>
                      <div className="mt-1">
                        {getDeliveryMethodBadge(selectedOrder.deliveryMethod)}
                      </div>
                    </div>
                    {selectedOrder.deliveryAddress && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Alamat Pengiriman</Label>
                        <p>{selectedOrder.deliveryAddress}</p>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Catatan</Label>
                        <p>{selectedOrder.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Coffee className="h-5 w-5" />
                      Item Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start p-4 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                            {item.variants && item.variants.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {item.variants.map((variant, vIndex) => (
                                  <div key={vIndex} className="text-sm">
                                    <span className="font-medium">{variant.name}:</span> {variant.option}
                                    {variant.priceModifier > 0 && (
                                      <span className="text-green-600 ml-1">
                                        (+{formatPrice(variant.priceModifier)})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {formatPrice(item.price * item.quantity + 
                                (item.variants?.reduce((sum, v) => sum + v.priceModifier, 0) || 0) * item.quantity
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    {/* Order Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Diskon {selectedOrder.promoCode && `(${selectedOrder.promoCode})`}</span>
                          <span>-{formatPrice(selectedOrder.discount)}</span>
                        </div>
                      )}
                      {selectedOrder.shippingCost > 0 && (
                        <div className="flex justify-between">
                          <span>Ongkos Kirim</span>
                          <span>{formatPrice(selectedOrder.shippingCost)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Timeline Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(event.status)}
                              <span className="text-sm text-muted-foreground">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{event.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Status Pesanan</DialogTitle>
              <DialogDescription>
                Ubah status pesanan {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status Baru *</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Catatan (Opsional)</Label>
                <Textarea
                  id="note"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Tambahkan catatan untuk perubahan status..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateStatus}
                  disabled={isSubmitting || !newStatus}
                  className="flex-1"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Status
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsUpdateStatusDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrderManagement;

