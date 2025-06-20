import React, { useState, useEffect, useCallback } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert'; // Import Alert

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
  CreditCard,
  MapPin,
  Phone,
  User as UserIcon,
  ShoppingBag,
  AlertCircle,
  Star,
  Loader2, 
  Send 
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea'; 

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, api } = useAuth(); 
  const { addToCart } = useCart(); 

  const [orders, setOrders] = useState([]); 
  const [filteredOrders, setFilteredOrders] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); 
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); 
  const [isModalLoading, setIsModalLoading] = useState(false); 
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State untuk mengontrol dialog

  // Order status configurations (sesuai backend OrderStatus enum) Ini itu untuk pembayaran aja
  const orderStatuses = {
    'PENDING': {
      label: 'Menunggu Pembayaran',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      description: 'Pesanan telah dibuat dan menunggu pembayaran Anda.'
    },
    'PROCESSING': {
      label: 'Diproses Pembayaran',
      color: 'bg-orange-100 text-orange-800',
      icon: CreditCard,
      description: 'Pembayaran pesanan Anda sedang diproses.'
    },
    'CONFIRMED': {
      label: 'Dikonfirmasi',
      color: 'bg-indigo-100 text-indigo-800',
      icon: CheckCircle,
      description: 'Pembayaran berhasil dikonfirmasi. Pesanan akan segera disiapkan.'
    },
    'PREPARING': {
      label: 'Disiapkan',
      color: 'bg-blue-100 text-blue-800',
      icon: Coffee,
      description: 'Pesanan Anda sedang disiapkan oleh barista kami.'
    },
    'READY': {
      label: 'Siap Ambil/Kirim',
      color: 'bg-purple-100 text-purple-800',
      icon: ShoppingBag,
      description: 'Pesanan Anda sudah siap untuk diambil atau akan segera dikirim.'
    },
    'DELIVERED': {
      label: 'Dikirim/Diambil',
      color: 'bg-teal-100 text-teal-800',
      icon: Truck,
      description: 'Pesanan Anda telah berhasil dikirim atau sudah Anda ambil.'
    },
    'COMPLETED': {
      label: 'Selesai',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      description: 'Pesanan telah selesai. Terima kasih!'
    },
    'CANCELLED': {
      label: 'Dibatalkan',
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
      description: 'Pesanan Anda telah dibatalkan.'
    },
  };



  // Fetch orders dari API
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!isAuthenticated) {
        // Jika belum auth, jangan fetch, biarkan useEffect di atas me-redirect
        setIsLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter.toUpperCase());
      }


      const response = await api.get(`/orders?${queryParams.toString()}`);
      setOrders(response.data);

    } catch (err) {
      console.error("Failed to fetch orders:", err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Gagal memuat riwayat pesanan. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api, statusFilter]); // Tambahkan statusFilter ke dependensi

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  // Filter dan Sort di Frontend (setelah data difetch)
  useEffect(() => {
    let currentFiltered = [...orders];

    // Filter by search term (order_id atau coffee_name)
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(order =>
        order.order_id?.toLowerCase().includes(lowercasedSearch) ||
        order.order_items?.some(item => // order_items harus ada
          item.coffee_name?.toLowerCase().includes(lowercasedSearch)
        )
      );
    }

    if (statusFilter !== 'all') {
      currentFiltered = currentFiltered.filter(order => order.status === statusFilter.toUpperCase());
    }


    // Sort orders
    currentFiltered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.ordered_at) - new Date(a.ordered_at);
        case 'oldest':
          return new Date(a.ordered_at) - new Date(b.ordered_at);
        case 'highest':
          return b.total_price - a.total_price;
        case 'lowest':
          return a.total_price - b.total_price;
        default:
          return new Date(b.ordered_at) - new Date(a.ordered_at);
      }
    });

    setFilteredOrders(currentFiltered);
  }, [orders, searchTerm, statusFilter, sortBy]);


  const handleReorder = (orderToReorder) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    orderToReorder.order_items?.forEach(item => {
      const coffeeForCart = {
        id: item.coffee.id,
        name: item.coffee.name,
        price: item.coffee.price,
        image_url: item.coffee.image_url,
        description: item.coffee.description,
      };

      // Varian juga perlu di-map ke format CartContext: { variant_id, name, additional_price, variant_type }
      const variantsForCart = item.variants.map(v => ({
        variant_id: v.variant_id,
        name: v.name,
        additional_price: v.additional_price,
        variant_type: v.variant_type // asumsi ada
      }));
      addToCart(coffeeForCart, variantsForCart, item.quantity);
    });
    navigate('/cart');
  };

  const handleRateOrder = async (orderIdToRate, rating, review) => {
    if (!isAuthenticated) {
      alert("Anda harus login untuk memberikan rating.");
      return;
    }
    try {

      const orderToRate = orders.find(o => o.id === orderIdToRate);
      if (!orderToRate || !orderToRate.order_items || orderToRate.order_items.length === 0) {
        alert("Tidak dapat memberikan rating: Detail order tidak lengkap.");
        return;
      }
      const firstCoffeeIdInOrder = orderToRate.order_items[0].coffee_id;

      const response = await api.post(`/ratings/coffee/${firstCoffeeIdInOrder}`, { rating, review });

      if (response.status === 201) {
        alert("Rating dan ulasan berhasil dikirim!");
        fetchOrders();
      } else {
        alert("Gagal mengirim rating: " + (response.data.detail || "Terjadi kesalahan."));
      }
    } catch (err) {
      console.error("Error submitting rating:", err.response?.data || err.message);
      alert("Gagal mengirim rating: " + (err.response?.data?.detail || "Terjadi kesalahan jaringan."));
    }
  };

  const handleCancelOrder = async (orderIdToCancel) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      return;
    }
    setIsLoading(true); // Set loading saat membatalkan
    try {
      // DELETE /orders/{order_id}
      const response = await api.delete(`/orders/${orderIdToCancel}`);
      if (response.status === 204) { // Status 204 No Content
        alert("Pesanan berhasil dibatalkan.");
        fetchOrders(); // Muat ulang daftar pesanan
      } else {
        alert("Gagal membatalkan pesanan.");
      }
    } catch (err) {
      console.error("Error canceling order:", err.response?.data || err.message);
      alert("Gagal membatalkan pesanan: " + (err.response?.data?.detail || "Terjadi kesalahan."));
    } finally {
      setIsLoading(false);
    }
  };


  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    // `ordered_at` dari backend adalah datetime string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Cek tanggal tidak valid
      return dateString;
    }
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = orderStatuses[status];
    if (!config) return null; // Handle undefined status
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Komponen OrderCard
  const OrderCard = ({ order }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Pesanan #{order.order_id}</CardTitle>
            <CardDescription>
              {formatDateTime(order.ordered_at)}
            </CardDescription>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          {order.order_items && order.order_items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                {item.coffee?.image_url ? (
                  <img src={item.coffee.image_url} alt={item.coffee.name} className="w-full h-full object-cover rounded" />
                ) : (
                  <Coffee className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.coffee_name}</p>
                {item.variants && item.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.variants.map((variant, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {variant.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {item.quantity}x {formatPrice(item.subtotal / item.quantity)}
                </p>
              </div>
              <span className="text-sm font-medium">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
          {order.order_items && order.order_items.length > 2 && (
            <p className="text-sm text-muted-foreground">
              +{order.order_items.length - 2} item lainnya
            </p>
          )}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-bold text-primary">{formatPrice(order.total_price)}</p>
          </div>
          <div className="flex gap-2">
            {/* Tombol Detail (tetap sama) */}
            <Dialog open={isDialogOpen && selectedOrderDetails?.id === order.id} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setIsModalLoading(true);
                    setIsDialogOpen(true);
                    try {
                      const response = await api.get(`/orders/${order.id}`); // cite: order_service.py
                      console.log("Fetched order details:", response.data);
                      setSelectedOrderDetails(response.data);
                    } catch (err) {
                      console.error("Failed to fetch order details for modal:", err.response?.data || err.message);
                      setError(err.response?.data?.detail || "Gagal memuat detail pesanan.");
                      setIsDialogOpen(false);
                    } finally {
                      setIsModalLoading(false);
                    }
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                {isModalLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Memuat detail...</span>
                  </div>
                ) : selectedOrderDetails ? (
                  <OrderDetailModal
                    order={selectedOrderDetails}
                    onRate={handleRateOrder}
                    onClose={() => setIsDialogOpen(false)}
                    onCancel={handleCancelOrder}
                    onReorder={() => handleReorder(selectedOrderDetails)}
                  />
                ) : (
                  <div className="text-center py-10 text-red-500">Gagal memuat detail pesanan.</div>
                )}
              </DialogContent>
            </Dialog>

            {/* Tombol "Lihat Pembayaran" atau "Lanjutkan Pembayaran" */}
            {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
              <Button
                variant="default" // Atau variant lain yang Anda suka
                size="sm"
                onClick={() => navigate(`/payment/${order.id}`)} // Arahkan ke PaymentPage dengan order ID
              >
                <CreditCard className="h-4 w-4 mr-1" />
                {order.status === 'PENDING' ? 'Bayar Sekarang' : 'Lihat Tagihan'}
              </Button>
            )}

            {/* Tombol Batalkan Pesanan */}
            {order.status === 'PENDING' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelOrder(order.id)}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Batalkan
              </Button>
            )}

            {order.status === 'COMPLETED' && (
              <Button
                size="sm"
                onClick={() => handleReorder(order)}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Pesan Lagi
              </Button>
            )}
          </div>
        </div>

        {/* Delivery Info - Ringkasan singkat di card utama */}
        <div className="text-sm text-muted-foreground mt-3">
          <div className="flex items-center gap-1">
            {order.order_items && order.order_items[0]?.coffee?.coffee_shop?.name && (
              <>
                <MapPin className="h-3 w-3" />
                <span>{order.order_items[0].coffee.coffee_shop.name}</span>
                <Separator orientation="vertical" className="h-4 mx-1" />
              </>
            )}
            {order.delivery_method ? ( // Gunakan properti delivery_method baru dari order
              order.delivery_method === 'delivery' ? (
                <> <Truck className="h-3 w-3" /> <span>Diantar</span> </>
              ) : (
                <> <Package className="h-3 w-3" /> <span>Ambil di toko</span> </>
              )
            ) : ( // Fallback jika properti delivery_method tidak ada
              order.payment_note && order.payment_note.includes("Delivery Method: delivery") ? (
                <> <Truck className="h-3 w-3" /> <span>Diantar</span> </>
              ) : (
                <> <Package className="h-3 w-3" /> <span>Ambil di toko</span> </>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Komponen OrderDetailModal
  const OrderDetailModal = ({ order, onRate, onClose, onCancel, onReorder }) => {
    const { api } = useAuth();
    const [rating, setRating] = useState(order.rating || 0); // Asumsi order.rating ada jika sudah dinilai
    const [review, setReview] = useState(order.review || ''); // Asumsi order.review ada jika sudah dinilai
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [ratingModalError, setRatingModalError] = useState('');
    const [ratingModalSuccess, setRatingModalSuccess] = useState('');

    const handleSubmitReview = async () => {
      if (rating === 0) {
        setRatingModalError('Harap berikan rating (bintang).');
        return;
      }
      setIsSubmittingReview(true);
      setRatingModalError('');
      setRatingModalSuccess('');
      try {
        const coffeeIdToRate = order.order_items[0]?.coffee_id;
        if (!coffeeIdToRate) {
          setRatingModalError("Tidak ada kopi untuk dinilai di pesanan ini.");
          setIsSubmittingReview(false);
          return;
        }

        const response = await api.post(`/ratings/coffee/${coffeeIdToRate}`, {
          rating: rating,
          review: review
        });

        if (response.status === 201) {
          setRatingModalSuccess('Ulasan berhasil dikirim!');
          onRate(order.id, rating, review); // Panggil fungsi dari parent untuk update UI utama
          setTimeout(() => {
            setRatingModalSuccess('');
            onClose();
          }, 1500);
        } else {
          setRatingModalError(response.data?.detail || 'Gagal mengirim ulasan.');
        }
      } catch (error) {
        console.error("Error submitting review:", error.response?.data || error.message);
        setRatingModalError(error.response?.data?.detail || 'Terjadi kesalahan saat mengirim ulasan.');
      } finally {
        setIsSubmittingReview(false);
      }
    };

    const renderStars = (currentRating, interactive = false, onStarClick = null) => {
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${ // Ukuran bintang lebih besar di modal
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
                } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
              onClick={interactive ? () => onStarClick(star) : undefined}
            />
          ))}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className='flex flex-col gap-2 text-center sm:text-left'>
          <h3 className="text-lg font-bold">Detail Pesanan #{order.order_id}</h3>
          <p className="text-sm text-muted-foreground">
            Dibuat pada: {formatDateTime(order.ordered_at)}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}
          <span className="text-sm text-muted-foreground">
            {orderStatuses[order.status]?.description}
          </span>
        </div>

        {/* Success/Error Messages for Rating */}
        {ratingModalSuccess && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{ratingModalSuccess}</AlertDescription>
          </Alert>
        )}
        {ratingModalError && (
          <Alert variant="destructive">
            <AlertDescription>{ratingModalError}</AlertDescription>
          </Alert>
        )}

        {/* Order Items */}
        <div className="space-y-4">
          <h4 className="font-medium">Item Pesanan</h4>
          {order.order_items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                {item.coffee?.image_url ? ( // item.coffee.image_url dari OrderItemResponse jika di-join
                  <img src={item.coffee.image_url} alt={item.coffee.name} className="w-full h-full object-cover rounded" />
                ) : (
                  <Coffee className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.coffee_name}</p>
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
              <span>{formatPrice(order.total_price)}</span> {/* total_price dari backend */}
            </div>

            {/* Discount dan Shipping: Asumsi ini akan dihitung atau didapat dari backend OrderWithItemsResponse */}
            {/* order.discount dan order.shipping tidak ada di OrderResponse. Jika ada, mereka perlu di-fetch */}
            {/* Jika backend tidak mengembalikan diskon/shipping, bagian ini akan kosong */}
            {/* {order.discount > 0 && (
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
            </div> */}

            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total_price)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="space-y-2">
          <h4 className="font-medium">
            Informasi {order.delivery_method === 'delivery' ? 'Pengiriman' : 'Pengambilan'}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span>{order.recipient_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.recipient_phone_number}</span>
            </div>
            {order.deliveryInfo?.deliveryMethod === 'delivery' && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{order.delivery_address}</span>
              </div>
            )}
            {order.deliveryInfo?.notes && (
              <div className="p-2 bg-muted/50 rounded">
                <strong>Catatan:</strong> {order.order_notes}
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
              <span>Pesanan dibuat: {formatDateTime(order.ordered_at)}</span>
            </div>
            {order.paid_at && ( // Gunakan `paid_at` dari OrderWithItemsResponse
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Pembayaran berhasil: {formatDateTime(order.paid_at)}</span>
              </div>
            )}
            {order.status === 'COMPLETED' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Pesanan selesai: {formatDateTime(order.updated_at)}</span>
              </div>
            )}
            {order.status === 'CANCELLED' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Pesanan dibatalkan: {formatDateTime(order.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating & Review */}
        {order.status === 'COMPLETED' && ( // Hanya bisa memberikan rating jika order sudah COMPLETED
          <div className="space-y-4">
            <h4 className="font-medium">Rating & Ulasan</h4>
            {order.rating && order.review ? ( // Jika order sudah dinilai (rating dan review ada di OrderWithItemsResponse)
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {renderStars(order.rating)}
                  <span className="text-sm text-muted-foreground">({order.rating}/5)</span>
                </div>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{order.review}</p>
              </div>
            ) : (
              // Form rating
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Berikan Rating</label>
                  {renderStars(rating, true, setRating)} {/* Pastikan setRating */}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tulis Ulasan (Opsional)</label>
                  <Textarea
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
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                    </>
                  ) : 'Kirim Ulasan'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // State loading untuk halaman utama
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

  // Pesan error jika gagal memuat orders
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchOrders} className="mt-4">Coba Lagi</Button>
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
                <SelectItem value="highest">Total Tertinggi</SelectItem> {/* total_price */}
                <SelectItem value="lowest">Total Terendah</SelectItem> {/* total_price */}
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
        {/* Jika Anda memiliki pagination di backend, ini akan relevan */}
        {filteredOrders.length > 0 && filteredOrders.length >= 20 && ( // Asumsi pagination setiap 20 item
          <div className="text-center mt-8">
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