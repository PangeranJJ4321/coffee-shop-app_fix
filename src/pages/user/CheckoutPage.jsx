import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CreditCard,
  Coffee,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  QrCode,
  Truck,
  Store,
  User as UserIcon,
  Phone,
  Clock10
} from 'lucide-react';
import { useCallback } from 'react';

const COFFEE_SHOP_ID = "ed634a6f-c12d-4ed4-8975-1926a2ee4a43";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, api } = useAuth();
  const { clearCart } = useCart();

  const [orderDataState, setOrderDataState] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone_number: '',
    address: '',
    notes: '',
    deliveryMethod: 'delivery' // 'delivery' or 'pickup'
  });
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Delivery time slots
  const mockTimeSlots = [
    { id: 'asap', label: 'Secepatnya (30-45 menit)', available: true },
    { id: '1hour', label: '1 jam dari sekarang', available: true },
    { id: '2hour', label: '2 jam dari sekarang', available: true },
    { id: 'evening', label: 'Sore hari (17:00-19:00)', available: true },
    { id: 'tomorrow', label: 'Besok pagi (09:00-11:00)', available: true }
  ];
  const [timeSlots, setTimeSlots] = useState(mockTimeSlots);

  const [selectedTimeSlot, setSelectedTimeSlot] = useState('asap');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get order data from cart page
    const orderStateFromLocation = location.state;
    if (!orderStateFromLocation || !orderStateFromLocation.cartItems || orderStateFromLocation.cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    setOrderDataState(orderStateFromLocation);

    // Pre-fill user information dari AuthContext
    if (user) {
      setDeliveryInfo(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone_number || ''
      }));
    }
  }, [isAuthenticated, location.state, navigate, user]);

  const fetchAvailableTimeSlots = useCallback(async () => {
    // Jika Anda ingin slot waktu dinamis berdasarkan tanggal, Anda bisa fetch di sini
    // const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    // try {
    //   const response = await api.get(`/coffee-shops/${COFFEE_SHOP_ID}/available-slots?date=${today}`);
    //   // Anda perlu memproses response.data menjadi format {id, label, available}
    //   // Contoh: response.data.map(slot => ({id: slot.id, label: `${slot.start_time}-${slot.end_time}`, available: slot.max_capacity > 0}))
    //   setTimeSlots(processedSlots);
    // } catch (err) {
    //   console.error("Failed to fetch time slots:", err);
    //   // Tangani error
    // }
  }, [api]);

  useEffect(() => {
    fetchAvailableTimeSlots();
  }, [fetchAvailableTimeSlots]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!deliveryInfo.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!deliveryInfo.phone_number.trim()) {
      newErrors.phone_number = 'Nomor telepon wajib diisi';
    } else if (!/^\+?\d{8,15}$/.test(deliveryInfo.phone_number)) {
      newErrors.phone_number = 'Format nomor telepon tidak valid. Gunakan format internasional (cth: +628123...).';
    }

    if (deliveryInfo.deliveryMethod === 'delivery' && !deliveryInfo.address.trim()) {
      newErrors.address = 'Alamat pengiriman wajib diisi';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan';
    }

    return newErrors;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsProcessing(true);
    setErrors({});


    try {
      const orderItems = orderDataState.cartItems.map(item => ({
        coffee_id: item.coffeeId,
        quantity: item.quantity,
        variants: item.variants.map(v => ({ variant_id: v.variant_id }))
      }));

      const orderPayload = {
        order_items: orderItems,
        delivery_info: {
          name: deliveryInfo.name,
          phone_number: deliveryInfo.phone_number,
          address: deliveryInfo.address,
          notes: deliveryInfo.notes,
          delivery_method: deliveryInfo.deliveryMethod
        }
      };

      const response = await api.post('/orders/', orderPayload);
      const createOrder = response.data;

      // Clear cart setelah pesanan dibuat di backend
      clearCart();

      // Navigasi kehalamamn pembayaran dengan order Id
      navigate(`/payment/${createOrder.id}`, {
        state: { order: createOrder }
      });

      localStorage.setItem('userOrders', JSON.stringify([...JSON.parse(localStorage.getItem('userOrders') || '[]'), createOrder]));
    } catch (error) {
      console.error("Failed to create order:", error);
      setErrors({ general: 'Terjadi kesalahan saat memproses pesanan' });
    } finally {
      setIsProcessing(false);
    }
  };

  // const calculateEstimatedDelivery = () => {
  //   const now = new Date();
  //   const timeSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);

  //   switch (selectedTimeSlot) {
  //     case 'asap':
  //       return new Date(now.getTime() + 45 * 60000); // 45 minutes
  //     case '1hour':
  //       return new Date(now.getTime() + 60 * 60000); // 1 hour
  //     case '2hour':
  //       return new Date(now.getTime() + 120 * 60000); // 2 hours
  //     case 'evening':
  //       const evening = new Date(now);
  //       evening.setHours(17, 0, 0, 0);
  //       return evening;
  //     case 'tomorrow':
  //       const tomorrow = new Date(now);
  //       tomorrow.setDate(tomorrow.getDate() + 1);
  //       tomorrow.setHours(9, 0, 0, 0);
  //       return tomorrow;
  //     default:
  //       return new Date(now.getTime() + 45 * 60000);
  //   }
  // };

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
    // Ini mungkin untuk order.estimatedDelivery. Konversi ke Date object.
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback jika tanggal tidak valid
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!orderDataState) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Clock10 className="h-12 w-12 text-primary animate-spin" />
          <p className="ml-4 text-muted-foreground">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Keranjang
          </Button>
          <div className=''>
            <div>
              <h1 className="text-3xl font-bold">Checkout</h1>
              <p className="text-muted-foreground">
                Lengkapi informasi pengiriman dan pembayaran
              </p>
            </div>
          </div>
        </div>

        {errors.general && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Metode Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryInfo.deliveryMethod}
                    onValueChange={(value) => setDeliveryInfo(prev => ({ ...prev, deliveryMethod: value }))}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Antar ke Alamat</p>
                            <p className="text-sm text-muted-foreground">
                              Pesanan akan diantar ke alamat Anda
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Store className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Ambil di Toko</p>
                            <p className="text-sm text-muted-foreground">
                              Ambil pesanan langsung di coffee shop
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Informasi {deliveryInfo.deliveryMethod === 'delivery' ? 'Pengiriman' : 'Penerima'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={deliveryInfo.name}
                        onChange={handleInputChange}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon *</Label>
                      <Input
                        id="phone"
                        name="phone_number"
                        value={deliveryInfo.phone_number}
                        onChange={handleInputChange}
                        placeholder="08xxxxxxxxxx"
                        className={errors.phone_number ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone_number}</p>
                      )}
                    </div>
                  </div>

                  {deliveryInfo.deliveryMethod === 'delivery' && (
                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat Lengkap *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={deliveryInfo.address}
                        onChange={handleInputChange}
                        placeholder="Masukkan alamat lengkap termasuk nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                        rows={3}
                        className={errors.address ? 'border-red-500' : ''}
                      />
                      {errors.address && (
                        <p className="text-sm text-red-500">{errors.address}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={deliveryInfo.notes}
                      onChange={handleInputChange}
                      placeholder="Catatan tambahan untuk pesanan Anda"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Waktu {deliveryInfo.deliveryMethod === 'delivery' ? 'Pengiriman' : 'Pengambilan'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    {timeSlots.map((slot) => (
                      <div key={slot.id} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={slot.id}
                          id={slot.id}
                          disabled={!slot.available}
                        />
                        <Label
                          htmlFor={slot.id}
                          className={`cursor-pointer ${!slot.available ? 'text-muted-foreground' : ''}`}
                        >
                          {slot.label}
                          {!slot.available && (
                            <Badge variant="secondary" className="ml-2">Tidak Tersedia</Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metode Pembayaran
                  </CardTitle>
                  <CardDescription>
                    Saat ini kami hanya menerima pembayaran melalui QRIS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <QrCode className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">QRIS (Quick Response Code Indonesian Standard)</p>
                        <p className="text-sm text-muted-foreground">
                          Bayar dengan scan QR code menggunakan aplikasi bank atau e-wallet
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={setAgreeToTerms}
                      className={errors.terms ? 'border-red-500' : ''}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      Saya menyetujui{' '}
                      <a href="/terms" className="text-primary hover:underline">
                        Syarat & Ketentuan
                      </a>{' '}
                      dan{' '}
                      <a href="/privacy" className="text-primary hover:underline">
                        Kebijakan Privasi
                      </a>
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-sm text-red-500 mt-2">{errors.terms}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {orderDataState.cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          {item.coffee?.image_url ? (
                            <img src={item.coffee.image_url} alt={item.coffee.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <Coffee className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.coffee.name}</p>
                          {item.variants && item.variants.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.variants.map((variant, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {variant.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x {formatPrice(item.subtotal / item.quantity)}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(orderDataState.subtotal)}</span>
                    </div>

                    {orderDataState.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Diskon</span>
                        <span>-{formatPrice(orderDataState.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Ongkos Kirim</span>
                      <span>
                        {orderDataState.shipping === 0 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          formatPrice(orderDataState.shipping)
                        )}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(orderDataState.total)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses Pesanan...
                      </>
                    ) : (
                      <>
                        Buat Pesanan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Transaksi Aman</p>
                      <p className="text-muted-foreground">
                        Data Anda dilindungi dengan enkripsi SSL dan sistem pembayaran yang aman.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

