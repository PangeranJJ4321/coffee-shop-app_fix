import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Import useMemo
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
  const { user: currentUser, api } = useAuth();

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // Ini akan menyimpan OrderWithItemsResponse
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderStatuses = useMemo(() => [
    { value: 'PENDING', label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'PROCESSING', label: 'Diproses Pembayaran', color: 'bg-orange-100 text-orange-800' },
    { value: 'CONFIRMED', label: 'Dikonfirmasi', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'PREPARING', label: 'Disiapkan', color: 'bg-blue-100 text-blue-800' },
    { value: 'READY', label: 'Siap Ambil/Kirim', color: 'bg-purple-100 text-purple-800' },
    { value: 'DELIVERED', label: 'Dikirim/Diambil', color: 'bg-teal-100 text-teal-800' },
    { value: 'COMPLETED', label: 'Selesai', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
  ], []);

  const paymentStatuses = useMemo(() => [
    { value: 'Paid', label: 'Dibayar', color: 'bg-green-100 text-green-800' },
    { value: 'Unpaid', label: 'Belum Dibayar', color: 'bg-red-100 text-red-800' }
  ], []);


  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchTerm && searchTerm.trim() !== "") {
      filtered = filtered.filter(order =>
        (order.order_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.items_summary || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_status === paymentFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'total_high':
          return b.total_price - a.total_price;
        case 'total_low':
          return a.total_price - b.total_price;
        case 'customer':
          return (a.user_name || "").localeCompare(b.user_name || "");
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, paymentFilter, sortBy]);


  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }

      const response = await api.get(`/admin/order-management/orders?${queryParams.toString()}`);
      setOrders(response.data);
      console.log("Orders Fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, [api, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  const handleUpdateStatus = useCallback(async () => {
    if (!selectedOrder || !newStatus) return;

    setIsSubmitting(true);
    try {
      const response = await api.put(
        `/admin/order-management/orders/${selectedOrder.id}/status`,
        { status: newStatus, notes: statusNote }
      );
      console.log("Order status updated:", response.data);
      fetchOrders();
      setIsUpdateStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
    } catch (error) {
      console.error("Failed to update order status:", error.response?.data || error.message);
      alert('Gagal mengupdate status pesanan: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSubmitting(false);
    }
  }, [api, selectedOrder, newStatus, statusNote, fetchOrders]);


  const openDetailDialog = useCallback(async (order) => {
    setIsLoading(true);
    try {
        const response = await api.get(`/admin/order-management/orders/${order.id}`);
        setSelectedOrder(response.data);
        setIsDetailDialogOpen(true);
    } catch (error) {
        console.error("Failed to fetch order details for modal:", error.response?.data || error.message);
        alert("Gagal memuat detail pesanan: " + (error.response?.data?.detail || error.message));
    } finally {
        setIsLoading(false);
    }
  }, [api]);


  const openUpdateStatusDialog = useCallback((order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setIsUpdateStatusDialogOpen(true);
  }, []);

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
        year: 'numeric',
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

  const getStatusBadge = useCallback((status) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    if (!statusConfig) return null;

    return (
      <Badge className={`${statusConfig.color} border-0`}>
        {statusConfig.label}
      </Badge>
    );
  }, [orderStatuses]);

  const getPaymentStatusBadge = useCallback((status) => {
    const statusConfig = paymentStatuses.find(s => s.value === status);
    if (!statusConfig) return null;
    return (
      <Badge className={`${statusConfig.color} border-0`}>
        {statusConfig.label}
      </Badge>
    );
  }, [paymentStatuses]);


  const getDeliveryMethodBadge = useCallback((method) => {
    const config = {
      'delivery': { label: 'Diantar', color: 'bg-blue-100 text-blue-800', icon: Truck },
      'pickup': { label: 'Ambil di Toko', color: 'bg-green-100 text-green-800', icon: Package }
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
  }, []);


  const OrderDetailModal = React.memo(({ order, onClose, onUpdateStatus, getStatusBadge, formatPrice, formatDate, getDeliveryMethodBadge, getPaymentStatusBadge }) => {
    const { api } = useAuth(); // Perlu akses api di sini
    const [history, setHistory] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    const fetchStatusHistory = useCallback(async () => {
      setIsHistoryLoading(true);
      try {
        const response = await api.get(`/admin/order-management/orders/${order.id}/status-history`);
        setHistory(response.data);
      } catch (err) {
        console.error("Failed to fetch order history:", err.response?.data || err.message);
      } finally {
        setIsHistoryLoading(false);
      }
    }, [api, order.id]);

    useEffect(() => {
      if (order?.id) {
        fetchStatusHistory();
      }
    }, [order?.id, fetchStatusHistory]);


    return (
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
              <p>{order.user_name}</p> {/* Mengakses dari order.user_name */}
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p>{order.user_email}</p> {/* Mengakses dari order.user_email */}
            </div>
            <div>
              <Label className="text-sm font-medium">Telepon</Label>
              <p>{order.recipient_phone_number || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Metode Pengiriman</Label>
              <div className="mt-1">
                {getDeliveryMethodBadge(order.delivery_method)}
              </div>
            </div>
            {order.delivery_address && (
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Alamat Pengiriman</Label>
                <p>{order.delivery_address}</p>
              </div>
            )}
            {order.order_notes && (
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Catatan</Label>
                <p>{order.order_notes}</p>
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
              {order.order_items.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-start p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.coffee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.coffee.price)}
                    </p>
                    {item.variants && item.variants.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.variants.map((variant, vIndex) => (
                          <div key={variant.id || vIndex} className="text-sm">
                            <span className="font-medium">{variant.name}:</span> {variant.name}
                            {variant.additional_price > 0 && (
                              <span className="text-green-600 ml-1">
                                (+{formatPrice(variant.additional_price)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatPrice(item.subtotal)}
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
                <span>{formatPrice(order.total_price)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon {order.promoCode && `(${order.promoCode})`}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.total_price)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Status Pembayaran</span>
                <span>{getPaymentStatusBadge(order.payment_status)}</span> {/* Mengakses dari order.payment_status */}
              </div>
              {order.paid_at && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Waktu Pembayaran</span>
                    <span>{formatDate(order.paid_at)}</span>
                  </div>
              )}
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
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Memuat riwayat status...</span>
              </div>
            ) : history.length === 0 ? (
              <p className="text-muted-foreground text-center">Tidak ada riwayat status.</p>
            ) : (
              <div className="space-y-4">
                {history.map((event, index) => (
                  <div key={event.id || index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(event.new_status)}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(event.changed_at)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">
                        {event.notes || `Status diubah menjadi ${event.new_status.toLowerCase().replace('_', ' ')}.`}
                        {event.changed_by_user_name && ` Oleh: ${event.changed_by_user_name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  });


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
            <Button variant="outline" onClick={fetchOrders}>
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
                    {orders.filter(o => ['PENDING', 'PROCESSING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)).length}
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
                    {formatPrice(orders.reduce((total, order) => total + order.total_price, 0))}
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
                            <p className="font-medium">{order.order_id}</p>
                            {getDeliveryMethodBadge(order.delivery_method)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.user_name}</p>
                            <p className="text-sm text-muted-foreground">{order.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.items_count} item</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items_summary}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold">{formatPrice(order.total_price)}</p>
                            {/* {order.discount > 0 && (
                              <p className="text-sm text-green-600">
                                Diskon: -{formatPrice(order.discount)}
                              </p>
                            )} */}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(order.payment_status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {order.payment_status === "Paid" ? "QRIS" : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(order.ordered_at)}</p>
                            {order.paid_at && (
                              <p className="text-muted-foreground">
                                Bayar: {formatDate(order.paid_at)}
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
              <DialogTitle>Detail Pesanan {selectedOrder?.order_id}</DialogTitle>
              <DialogDescription>
                Informasi lengkap pesanan pelanggan
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <OrderDetailModal
                order={selectedOrder}
                onClose={() => setIsDetailDialogOpen(false)}
                onUpdateStatus={openUpdateStatusDialog}
                getStatusBadge={getStatusBadge}
                formatPrice={formatPrice}
                formatDate={formatDate}
                getDeliveryMethodBadge={getDeliveryMethodBadge}
                getPaymentStatusBadge={getPaymentStatusBadge}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Status Pesanan</DialogTitle>
              <DialogDescription>
                Ubah status pesanan {selectedOrder?.order_id}
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