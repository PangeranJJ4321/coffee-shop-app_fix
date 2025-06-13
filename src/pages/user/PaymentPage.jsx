import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { Progress } from '@/components/ui/progress';
import { 
  QrCode, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  RefreshCw,
  ArrowLeft,
  Coffee,
  Smartphone,
  CreditCard,
  Timer,
  X,
  MapPin,
  Store,
  User,
  Phone
} from 'lucide-react';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, PROCESSING, SUCCESS, FAILED, EXPIRED
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [qrCodeData, setQrCodeData] = useState('');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Mock QRIS QR code data
  const mockQRData = `00020101021226580014ID.CO.QRIS.WWW0215ID20232024567890303UMI51440014ID.LINKAJA.WWW0118910123456789012345204599953033605802ID5914COFFEE SHOP APP6007JAKARTA61051234562070703A0163044B2A`;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get order data from location state or localStorage
    let orderData = location.state?.order;
    
    if (!orderData) {
      // Try to get from localStorage
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      orderData = savedOrders.find(o => o.id.toString() === orderId);
    }

    if (!orderData) {
      navigate('/order-history');
      return;
    }

    setOrder(orderData);
    setQrCodeData(mockQRData);

    // Start payment timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPaymentStatus('EXPIRED');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate payment status checking
    const statusChecker = setInterval(() => {
      if (paymentStatus === 'PENDING') {
        // Simulate random payment success (for demo purposes)
        if (Math.random() < 0.1) { // 10% chance every 5 seconds
          setPaymentStatus('SUCCESS');
          clearInterval(statusChecker);
          clearInterval(timer);
          
          // Update order status in localStorage
          const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
          const updatedOrders = savedOrders.map(o => 
            o.id.toString() === orderId 
              ? { ...o, status: 'PAID', paidAt: new Date().toISOString() }
              : o
          );
          localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
        }
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(statusChecker);
    };
  }, [isAuthenticated, orderId, location.state, navigate, paymentStatus]);

  const handleCopyQRData = () => {
    navigator.clipboard.writeText(qrCodeData);
    alert('Kode QRIS berhasil disalin!');
  };

  const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    
    // Simulate payment checking
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo, randomly set payment as success
    if (Math.random() < 0.7) {
      setPaymentStatus('SUCCESS');
      
      // Update order status
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const updatedOrders = savedOrders.map(o => 
        o.id.toString() === orderId 
          ? { ...o, status: 'PAID', paidAt: new Date().toISOString() }
          : o
      );
      localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
    }
    
    setIsCheckingPayment(false);
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  const handleViewOrder = () => {
    navigate('/order-history');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  // Payment Success Screen
  if (paymentStatus === 'SUCCESS') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-green-600">Pembayaran Berhasil!</h1>
            <p className="text-muted-foreground">
              Terima kasih! Pesanan Anda telah dikonfirmasi dan sedang diproses.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detail Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nomor Pesanan</p>
                  <p className="font-medium">#{order.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Pembayaran</p>
                  <p className="font-medium text-primary">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Metode Pengiriman</p>
                  <p className="font-medium">
                    {order.deliveryInfo.deliveryMethod === 'delivery' ? 'Antar ke Alamat' : 'Ambil di Toko'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estimasi {order.deliveryInfo.deliveryMethod === 'delivery' ? 'Pengiriman' : 'Siap'}</p>
                  <p className="font-medium">{formatDateTime(order.estimatedDelivery)}</p>
                </div>
              </div>

              {order.deliveryInfo.deliveryMethod === 'delivery' && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Alamat Pengiriman</p>
                      <p className="text-sm text-muted-foreground">{order.deliveryInfo.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryInfo.name} - {order.deliveryInfo.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleViewOrder} size="lg">
              Lihat Status Pesanan
            </Button>
            <Button variant="outline" onClick={handleBackToMenu} size="lg">
              Kembali ke Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Expired Screen
  if (paymentStatus === 'EXPIRED') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-red-600">Pembayaran Kedaluwarsa</h1>
            <p className="text-muted-foreground">
              Waktu pembayaran telah habis. Silakan buat pesanan baru.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/cart')} size="lg">
              Buat Pesanan Baru
            </Button>
            <Button variant="outline" onClick={handleBackToMenu} size="lg">
              Kembali ke Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Pending Screen
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/checkout')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Pembayaran QRIS</h1>
            <p className="text-muted-foreground">
              Scan QR code untuk menyelesaikan pembayaran
            </p>
          </div>
        </div>

        {/* Timer Alert */}
        <Alert className="mb-6">
          <Timer className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Selesaikan pembayaran dalam: <strong>{formatTime(timeLeft)}</strong></span>
              <Badge variant={timeLeft < 300 ? 'destructive' : 'secondary'}>
                {timeLeft < 300 ? 'Segera Berakhir' : 'Aktif'}
              </Badge>
            </div>
            <Progress value={(timeLeft / 900) * 100} className="mt-2" />
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Scan QR Code
                </CardTitle>
                <CardDescription>
                  Gunakan aplikasi bank atau e-wallet untuk scan QR code di bawah
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="w-64 h-64 bg-white border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">QR Code QRIS</p>
                      <p className="text-xs text-muted-foreground">
                        Total: {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Copy QR Data */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Kode QRIS (Manual)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={qrCodeData}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyQRData}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Check Payment Button */}
                <Button
                  onClick={handleCheckPayment}
                  disabled={isCheckingPayment}
                  className="w-full"
                  size="lg"
                >
                  {isCheckingPayment ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Mengecek Pembayaran...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Cek Status Pembayaran
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            {showInstructions && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Cara Pembayaran</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInstructions(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Buka Aplikasi</p>
                        <p className="text-sm text-muted-foreground">
                          Buka aplikasi bank atau e-wallet yang mendukung QRIS
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Scan QR Code</p>
                        <p className="text-sm text-muted-foreground">
                          Pilih menu scan QR dan arahkan kamera ke QR code di atas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Konfirmasi Pembayaran</p>
                        <p className="text-sm text-muted-foreground">
                          Periksa detail pembayaran dan konfirmasi transaksi
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Selesai</p>
                        <p className="text-sm text-muted-foreground">
                          Pembayaran berhasil, pesanan akan segera diproses
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="font-medium text-sm">Aplikasi yang Didukung:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-muted rounded text-center">GoPay</div>
                      <div className="p-2 bg-muted rounded text-center">OVO</div>
                      <div className="p-2 bg-muted rounded text-center">DANA</div>
                      <div className="p-2 bg-muted rounded text-center">LinkAja</div>
                      <div className="p-2 bg-muted rounded text-center">ShopeePay</div>
                      <div className="p-2 bg-muted rounded text-center">Bank Apps</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detail Pesanan</CardTitle>
                <CardDescription>
                  Pesanan #{order.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        <Coffee className="h-6 w-6 text-muted-foreground" />
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
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
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
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Pembayaran</span>
                    <span className="text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {order.deliveryInfo.deliveryMethod === 'delivery' ? (
                    <MapPin className="h-5 w-5" />
                  ) : (
                    <Store className="h-5 w-5" />
                  )}
                  Informasi {order.deliveryInfo.deliveryMethod === 'delivery' ? 'Pengiriman' : 'Pengambilan'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.deliveryInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.deliveryInfo.phone}</span>
                  </div>
                  {order.deliveryInfo.deliveryMethod === 'delivery' && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{order.deliveryInfo.address}</span>
                    </div>
                  )}
                  {order.deliveryInfo.notes && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">
                        <strong>Catatan:</strong> {order.deliveryInfo.notes}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Estimasi {order.deliveryInfo.deliveryMethod === 'delivery' ? 'Pengiriman' : 'Siap'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(order.estimatedDelivery)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

