import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  Coffee,
  Eye,
  RotateCcw,
  Calendar,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  AlertCircle,
  Star
} from 'lucide-react';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Order status configurations
  const orderStatuses = {
    'PENDING': { 
      label: 'Menunggu Pembayaran', 
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      description: 'Pesanan menunggu pembayaran'
    },
    'PAID': { 
      label: 'Dibayar', 
      color: 'bg-blue-100 text-blue-800',
      icon: CheckCircle,
      description: 'Pembayaran berhasil, pesanan sedang diproses'
    },
    'PROCESSING': { 
      label: 'Diproses', 
      color: 'bg-purple-100 text-purple-800',
      icon: Package,
      description: 'Pesanan sedang disiapkan'
    },
    'READY': { 
      label: 'Siap', 
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      description: 'Pesanan siap untuk diambil/dikirim'
    },
    'DELIVERED': { 
      label: 'Selesai', 
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      description: 'Pesanan telah selesai'
    },
    'CANCELLED': { 
      label: 'Dibatalkan', 
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
      description: 'Pesanan dibatalkan'
    }
  };

  // Mock order data
  const mockOrders = [
    {
      id: 1703123456789,
      items: [
        {
          id: 1,
          coffee: { id: 1, name: 'Espresso Premium', price: 25000 },
          variants: [{ name: 'Medium' }, { name: 'Normal Sugar' }],
          quantity: 2,
          subtotal: 50000
        },
        {
          id: 2,
          coffee: { id: 2, name: 'Cappuccino Special', price: 32000 },
          variants: [{ name: 'Large' }, { name: 'Oat Milk' }],
          quantity: 1,
          subtotal: 40000
        }
      ],
      subtotal: 90000,
      discount: 9000,
      shipping: 0,
      total: 81000,
      appliedPromo: { code: 'WELCOME10', description: 'Diskon 10%' },
      deliveryInfo: {
        name: 'John Doe',
        phone: '081234567890',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        deliveryMethod: 'delivery'
      },
      status: 'DELIVERED',
      createdAt: '2024-01-15T10:30:00Z',
      paidAt: '2024-01-15T10:35:00Z',
      estimatedDelivery: '2024-01-15T11:15:00Z',
      deliveredAt: '2024-01-15T11:10:00Z',
      rating: 5,
      review: 'Kopi sangat enak dan pengiriman cepat!'
    },
    {
      id: 1703123456788,
      items: [
        {
          id: 3,
          coffee: { id: 3, name: 'Latte Art', price: 35000 },
          variants: [{ name: 'Medium' }, { name: 'Less Sugar' }],
          quantity: 1,
          subtotal: 35000
        }
      ],
      subtotal: 35000,
      discount: 0,
      shipping: 10000,
      total: 45000,
      deliveryInfo: {
        name: 'John Doe',
        phone: '081234567890',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        deliveryMethod: 'pickup'
      },
      status: 'READY',
      createdAt: '2024-01-14T14:20:00Z',
      paidAt: '2024-01-14T14:25:00Z',
      estimatedDelivery: '2024-01-14T15:00:00Z'
    },
    {
      id: 1703123456787,
      items: [
        {
          id: 4,
          coffee: { id: 4, name: 'Americano', price: 22000 },
          variants: [{ name: 'Large' }, { name: 'No Sugar' }],
          quantity: 3,
          subtotal: 66000
        }
      ],
      subtotal: 66000,
      discount: 0,
      shipping: 0,
      total: 66000,
      deliveryInfo: {
        name: 'John Doe',
        phone: '081234567890',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        deliveryMethod: 'delivery'
      },
      status: 'PROCESSING',
      createdAt: '2024-01-13T09:15:00Z',
      paidAt: '2024-01-13T09:20:00Z',
      estimatedDelivery: '2024-01-13T10:00:00Z'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load orders from localStorage and merge with mock data
    setIsLoading(true);
    setTimeout(() => {
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const allOrders = [...savedOrders, ...mockOrders];
      setOrders(allOrders);
      setFilteredOrders(allOrders);
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.items.some(item => 
          item.coffee.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.total - a.total;
        case 'lowest':
          return a.total - b.total;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy]);

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart(item.coffee, item.variants, item.quantity);
    });
    navigate('/cart');
  };

  const handleRateOrder = (orderId, rating, review) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, rating, review }
        : order
    );
    setOrders(updatedOrders);
    
    // Update localStorage
    const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const updatedSavedOrders = savedOrders.map(order =>
      order.id === orderId
        ? { ...order, rating, review }
        : order
    );
    localStorage.setItem('userOrders', JSON.stringify(updatedSavedOrders));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = orderStatuses[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const OrderCard = ({ order }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Pesanan #{order.id}</CardTitle>
            <CardDescription>
              {formatDateTime(order.createdAt)}
            </CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <Coffee className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.coffee.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity}x {formatPrice(item.subtotal / item.quantity)}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-muted-foreground">
              +{order.items.length - 2} item lainnya
            </p>
          )}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-bold text-primary">{formatPrice(order.total)}</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedOrder(order)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detail Pesanan #{order.id}</DialogTitle>
                  <DialogDescription>
                    {formatDateTime(order.createdAt)}
                  </DialogDescription>
                </DialogHeader>
                <OrderDetailModal order={order} onRate={handleRateOrder} />
              </DialogContent>
            </Dialog>
            
            {order.status === 'DELIVERED' && (
              <Button 
                size="sm"
                onClick={() => handleReorder(order)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Pesan Lagi
              </Button>
            )}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            {order.deliveryInfo.deliveryMethod === 'delivery' ? (
              <Truck className="h-3 w-3" />
            ) : (
              <Package className="h-3 w-3" />
            )}
            <span>
              {order.deliveryInfo.deliveryMethod === 'delivery' ? 'Diantar' : 'Ambil di toko'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OrderDetailModal = ({ order, onRate }) => {
    const [rating, setRating] = useState(order.rating || 0);
    const [review, setReview] = useState(order.review || '');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleSubmitReview = async () => {
      setIsSubmittingReview(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRate(order.id, rating, review);
      setIsSubmittingReview(false);
    };

    const renderStars = (currentRating, interactive = false) => {
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= currentRating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-muted-foreground'
              } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
              onClick={interactive ? () => setRating(star) : undefined}
            />
          ))}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}
          <span className="text-sm text-muted-foreground">
            {orderStatuses[order.status].description}
          </span>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h4 className="font-medium">Item Pesanan</h4>
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <Coffee className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.coffee.name}</p>
                {item.variants && item.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.variants.map((variant, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {variant.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {item.quantity}x {formatPrice(item.subtotal / item.quantity)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(item.subtotal)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium">Rincian Pembayaran</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon {order.appliedPromo?.code}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Ongkos Kirim</span>
              <span>
                {order.shipping === 0 ? (
                  <span className="text-green-600">Gratis</span>
                ) : (
                  formatPrice(order.shipping)
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="space-y-2">
          <h4 className="font-medium">
            Informasi {order.deliveryInfo.deliveryMethod === 'delivery' ? 'Pengiriman' : 'Pengambilan'}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{order.deliveryInfo.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.deliveryInfo.phone}</span>
            </div>
            {order.deliveryInfo.deliveryMethod === 'delivery' && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{order.deliveryInfo.address}</span>
              </div>
            )}
            {order.deliveryInfo.notes && (
              <div className="p-2 bg-muted/50 rounded">
                <strong>Catatan:</strong> {order.deliveryInfo.notes}
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <h4 className="font-medium">Timeline Pesanan</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Pesanan dibuat: {formatDateTime(order.createdAt)}</span>
            </div>
            {order.paidAt && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Pembayaran berhasil: {formatDateTime(order.paidAt)}</span>
              </div>
            )}
            {order.deliveredAt && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Pesanan selesai: {formatDateTime(order.deliveredAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating & Review */}
        {order.status === 'DELIVERED' && (
          <div className="space-y-4">
            <h4 className="font-medium">Rating & Ulasan</h4>
            {order.rating ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {renderStars(order.rating)}
                  <span className="text-sm text-muted-foreground">({order.rating}/5)</span>
                </div>
                {order.review && (
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{order.review}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Berikan Rating</label>
                  {renderStars(rating, true)}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tulis Ulasan (Opsional)</label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Bagikan pengalaman Anda..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || isSubmittingReview}
                  size="sm"
                >
                  {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat riwayat pesanan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Riwayat Pesanan</h1>
          <p className="text-muted-foreground">
            Lihat dan kelola semua pesanan Anda
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor pesanan atau nama kopi..."
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
                {Object.entries(orderStatuses).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="highest">Tertinggi</SelectItem>
                <SelectItem value="lowest">Terendah</SelectItem>
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
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold">
                {orders.length === 0 ? 'Belum Ada Pesanan' : 'Tidak Ada Hasil'}
              </h2>
              <p className="text-muted-foreground">
                {orders.length === 0 
                  ? 'Anda belum pernah melakukan pesanan. Yuk, mulai pesan kopi favorit!'
                  : 'Coba ubah filter atau kata kunci pencarian Anda'
                }
              </p>
              <Button onClick={() => navigate('/menu')}>
                <Coffee className="mr-2 h-4 w-4" />
                Jelajahi Menu
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Load More (for pagination in real app) */}
        {filteredOrders.length > 0 && filteredOrders.length >= 10 && (
          <div className="text-center">
            <Button variant="outline" size="lg">
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;

