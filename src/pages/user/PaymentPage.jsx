import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from '@/components/ui/progress';
import QRCode from 'react-qr-code';

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
  User as UserIcon,
  Phone,
  Loader2
} from 'lucide-react';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, api } = useAuth();

  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [vaNumbers, setVaNumbers] = useState([]);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Ref untuk mencegah `useEffect` memicu `create payment` berkali-kali di StrictMode
  const hasAttemptedPaymentCreation = useRef(false);
  const hasInitialized = useRef(false);
  const isCreatingPayment = useRef(false);
  const orderIdRef = useRef(orderId);

  // Fungsi helper untuk memperbarui status order di localStorage (opsional, untuk cache frontend)
  const updateOrderStatusInLocalStorage = useCallback((newStatus, paidAt = null) => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const updatedOrders = savedOrders.map(o =>
        o.id === orderId || o.order_id === orderId
          ? { ...o, status: newStatus, paid_at: paidAt || o.paidAt }
          : o
      );
      localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
    } catch (e) {
      console.error("Failed to update order in localStorage:", e);
    }
  }, [orderId]);

  console.log('🔍 Payment Status Debug:', {
    paymentStatus,
    isCheckingPayment,
    timeLeft,
    isButtonDisabled: isCheckingPayment || paymentStatus !== 'PENDING'
  });


  // Fungsi untuk mendapatkan status pembayaran dari backend Midtrans
  const fetchPaymentStatus = useCallback(async () => {
    setIsCheckingPayment(true);
    try {
      const response = await api.get(`/payments/${orderId}/status`);
      const statusData = response.data;

      console.log('📊 Status dari backend:', statusData);
      setPaymentStatus(statusData.status);

      if (statusData.status === 'SUCCESS') {
        if (order) {
          setOrder(prevOrder => ({ ...prevOrder, status: 'COMPLETED', paid_at: statusData.payment_time }));
        }
        updateOrderStatusInLocalStorage('COMPLETED', statusData.payment_time);
      } else if (statusData.status === 'FAILED' || statusData.status === 'EXPIRED') {
        if (order) {
          setOrder(prevOrder => ({ ...prevOrder, status: 'CANCELLED' }));
        }
        updateOrderStatusInLocalStorage('CANCELLED');
      }
    } catch (err) {
      console.error("Failed to check payment status:", err.response?.data || err.message);
    } finally {
      setIsCheckingPayment(false);
    }
  }, [orderId, api, order, updateOrderStatusInLocalStorage]);


   useEffect(() => {
    if (orderIdRef.current !== orderId) {
      hasInitialized.current = false;
      isCreatingPayment.current = false;
      orderIdRef.current = orderId;
    }
  }, [orderId]);

  // PERBAIKAN: Fungsi create payment terpisah dengan guard yang lebih ketat
  const createNewPayment = useCallback(async (orderData) => {
    // Guard: Cegah multiple creation
    if (isCreatingPayment.current) {
      console.log('⚠️ Payment creation already in progress, skipping...');
      return null;
    }

    isCreatingPayment.current = true;
    console.log('💳 Creating new payment from Midtrans...');
    
    try {
      const paymentCreateResponse = await api.post('/payments/create', {
        order_id: orderData.id,
        payment_method: 'gopay'
      });
      console.log('✅ New payment successfully created:', paymentCreateResponse.data);
      return paymentCreateResponse.data;
    } catch (createErr) {
      console.error('❌ Failed to create payment:', createErr.response?.data || createErr.message);
      throw createErr;
    } finally {
      isCreatingPayment.current = false;
    }
  }, [api]);


  // Effect utama untuk memuat data order dan membuat/mengelola pembayaran
  useEffect(() => {
    // Guard: Cegah re-initialization
    if (hasInitialized.current) {
      console.log('🔒 Already initialized, skipping...');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadDataAndHandlePayment = async () => {
      // Mark as initialized immediately
      hasInitialized.current = true;
      
      setIsLoadingInitialData(true);
      setPageError(null);

      try {
        // LANGKAH 1: Fetch order details
        console.log('📋 Fetching order details from backend...');
        const orderDetailsApiResp = await api.get(`/orders/${orderId}`);
        const fetchedOrderFromBackend = orderDetailsApiResp.data;

        if (!fetchedOrderFromBackend.order_items) {
          fetchedOrderFromBackend.order_items = [];
        }

        setOrder(fetchedOrderFromBackend);
        setPaymentStatus(fetchedOrderFromBackend.status);
        console.log('✅ Order details loaded:', fetchedOrderFromBackend);

        // Jika order sudah dalam status final, tidak perlu melanjutkan
        if (['COMPLETED', 'CANCELLED', 'FAILED'].includes(fetchedOrderFromBackend.status)) {
          console.log('🏁 Order is in final status:', fetchedOrderFromBackend.status);
          setIsLoadingInitialData(false);
          return;
        }

        let currentTransactionDetails = null;

        // LANGKAH 2: Cek existing transaction
        try {
          console.log('🔍 Checking for existing transaction details...');
          const transactionDetailsResp = await api.get(`/payments/${orderId}/transaction-details`);
          currentTransactionDetails = transactionDetailsResp.data;
          console.log('✅ Retrieved existing payment details:', currentTransactionDetails);
        } catch (fetchErr) {
          if (fetchErr.response?.status === 404) {
            console.log('ℹ️ No existing transaction found, will attempt to create.');
          } else {
            console.error("❌ Error fetching existing transaction details:", fetchErr.response?.data || fetchErr.message);
            setPageError(fetchErr.response?.data?.detail || "Gagal memuat detail transaksi yang sudah ada.");
            return;
          }
        }

        // LANGKAH 3: Handle payment creation/retrieval
        if (!currentTransactionDetails) {
          // Tidak ada transaksi - buat baru
          try {
            currentTransactionDetails = await createNewPayment(fetchedOrderFromBackend);
            if (!currentTransactionDetails) {
              setPageError("Gagal membuat pembayaran baru.");
              return;
            }
          } catch (createErr) {
            setPageError(createErr.response?.data?.detail || "Gagal membuat pembayaran baru.");
            return;
          }
        } else {
          // Ada transaksi existing - cek status
          const existingStatus = currentTransactionDetails.status;
          console.log('📋 Existing transaction status:', existingStatus);

          if (existingStatus === 'PENDING' || existingStatus === 'PROCESSING') {
            console.log('✅ Using existing active transaction.');
          } else if (existingStatus === 'EXPIRED' || existingStatus === 'FAILED' || existingStatus === 'CANCELLED') {
            // Transaksi tidak aktif - buat yang baru
            try {
              console.log('🔄 Existing transaction is inactive. Creating new payment...');
              currentTransactionDetails = await createNewPayment(fetchedOrderFromBackend);
              if (!currentTransactionDetails) {
                setPageError("Gagal membuat pembayaran pengganti.");
                return;
              }
            } catch (createErr) {
              setPageError(createErr.response?.data?.detail || "Gagal membuat pembayaran pengganti.");
              return;
            }
          } else if (existingStatus === 'SUCCESS') {
            console.log('💚 Payment already successful.');
            setPaymentStatus('SUCCESS');
            setIsLoadingInitialData(false);
            return;
          }
        }

        // LANGKAH 4: Setup UI
        if (currentTransactionDetails) {
          console.log('🎨 Setting up payment UI with transaction details...');
          setPaymentDetails(currentTransactionDetails);
          setQrCodeValue(currentTransactionDetails.qr_code_url || currentTransactionDetails.deeplink_url || '');

          const vaNumbers = currentTransactionDetails.va_numbers || [];
          setVaNumbers(Array.isArray(vaNumbers) ? vaNumbers : []);

          if (currentTransactionDetails.expiry_time) {
            const expiryDate = new Date(currentTransactionDetails.expiry_time);
            const now = new Date();
            const timeDiffSeconds = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / 1000));
            setTimeLeft(timeDiffSeconds);

            if (timeDiffSeconds === 0) {
              setPaymentStatus('EXPIRED');
            } else {
              setPaymentStatus(currentTransactionDetails.status);
            }
          } else {
            setPaymentStatus(currentTransactionDetails.status);
          }
          console.log('✅ Payment UI setup completed');
        } else {
          console.error('❌ No valid transaction details available after all attempts');
          setPageError("Tidak dapat memuat detail pembayaran. Silakan coba lagi.");
          setPaymentStatus('FAILED');
        }

      } catch (err) {
        console.error("❌ Failed to load payment data:", err.response?.data || err.message || err.toString());
        setPageError(err.response?.data?.detail || err.message || 'Gagal memuat halaman pembayaran. Silakan coba lagi.');
        setPaymentStatus('FAILED');
        // PERBAIKAN: Reset flag hanya pada error yang tidak dapat dipulihkan
        hasInitialized.current = false;
      } finally {
        setIsLoadingInitialData(false);
        console.log('🏁 loadDataAndHandlePayment completed');
      }
    };

    loadDataAndHandlePayment();

  }, [isAuthenticated, orderId, navigate, api, createNewPayment]);

  // Effect untuk timer dan auto-check status
  useEffect(() => {
    let timerInterval;
    let statusCheckerInterval;

    if (paymentStatus === 'PENDING' && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPaymentStatus('EXPIRED');
            clearInterval(timerInterval);
            clearInterval(statusCheckerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Otomatis cek status setiap 10 detik (sesuaikan interval jika perlu)
      statusCheckerInterval = setInterval(() => {
        if (paymentStatus === 'PENDING') { // Hanya cek jika status masih pending
          fetchPaymentStatus();
        }
      }, 10000); // Cek setiap 10 detik
    }

    // Cleanup saat komponen unmount atau status berubah
    return () => {
      clearInterval(timerInterval);
      clearInterval(statusCheckerInterval);
    };
  }, [paymentStatus, timeLeft, fetchPaymentStatus]);


  const handleCopyQRData = () => {
    if (qrCodeValue) {
      navigator.clipboard.writeText(qrCodeValue);
      alert('Kode QRIS berhasil disalin!');
    }
  };

  // Fungsi yang dipanggil saat tombol "Coba Lagi" diklik
  const resetPaymentPageAndRetry = useCallback(() => {
    console.log('🔄 Retrying payment creation...');
    hasInitialized.current = false;
    isCreatingPayment.current = false;
    setPageError(null);
    setPaymentStatus('PENDING');
    setIsLoadingInitialData(true);
    // Force re-mount component instead of reload
    navigate(`/payment/${orderId}`, { replace: true });
  }, [orderId, navigate]);

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  const handleViewOrder = () => {
    navigate('/orders');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state awal halaman
  if (isLoadingInitialData || !order) { // Gunakan isLoadingInitialData
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="ml-4 text-muted-foreground">Memuat halaman pembayaran...</p>
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
                  <p className="font-medium">#{order.order_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Pembayaran</p>
                  <p className="font-medium text-primary">{formatPrice(order.total_price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Metode Pembayaran</p>
                  <p className="font-medium">QRIS</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Waktu Pesanan</p>
                  <p className="font-medium">{formatDateTime(order.ordered_at)}</p>
                </div>
              </div>

              {/* Delivery Info - Jika Anda ingin menampilkan ini, pastikan order.deliveryInfo tersedia */}
              {/* Ini akan membutuhkan perubahan di OrderWithItemsResponse backend untuk menyertakan deliveryInfo */}
              {/* Untuk saat ini, saya akan menampilkannya jika `order.deliveryInfo` ada dari CheckoutPage (yang tidak akan bertahan di refresh) */}
              {/* Jika ingin selalu ada, Anda perlu menyimpan ini di OrderModel di backend. */}
              {order.deliveryInfo?.deliveryMethod && (
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

  // Render error message jika ada error dari fetch data atau create payment
  if (paymentStatus === 'FAILED' || pageError) { // Gunakan pageError
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-red-600">Pembayaran Gagal</h1>
            <p className="text-muted-foreground">
              Terjadi kesalahan saat memproses pembayaran Anda. {pageError}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={resetPaymentPageAndRetry} // Panggil fungsi reset dan retry
              size="lg"
            >
              Coba Lagi
            </Button>
            <Button onClick={() => navigate('/cart')} variant="outline" size="lg">
              Kembali ke Keranjang
            </Button>
            <Button variant="outline" onClick={() => navigate('/menu')} size="lg">
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
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/checkout')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <div className='flex items-center gap-4'>
            <div>
              <h1 className="text-3xl font-bold">Pembayaran QRIS</h1>
              <p className="text-muted-foreground">
                Scan QR code untuk menyelesaikan pembayaran
              </p>
            </div>
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
            <Progress value={(timeLeft / 900) * 100} className="mt-2" /> {/* Asumsi total 900 detik = 15 menit */}
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
                    {qrCodeValue ? (
                      <QRCode value={qrCodeValue} size={256} level="H" />
                    ) : (
                      <div className="text-center space-y-2">
                        <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">QR Code Tidak Tersedia</p>
                      </div>
                    )}
                  </div>
                </div>
                {vaNumbers.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nomor Virtual Account</Label>
                    {vaNumbers.map((va, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={`${va.bank}: ${va.va_number}`} readOnly className="font-mono text-xs" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(va.va_number)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}


                {/* Copy QR Data */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Kode QRIS (Manual)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={qrCodeValue}
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
                  onClick={fetchPaymentStatus} 
                  disabled={isCheckingPayment}
                  className="w-full"
                  size="lg"
                >
                  {isCheckingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengecek Pembayaran...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Status Pembayaran
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
                  Pesanan #{order.order_id} {/* order_id dari backend */}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {/* Pastikan order.order_items adalah array sebelum memanggil map */}
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          {item.coffee?.image_url ? (
                            <img src={item.coffee.image_url} alt={item.coffee.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <Coffee className="h-6 w-6 text-muted-foreground" />
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
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x {formatPrice(item.subtotal / item.quantity)}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatPrice(item.subtotal)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center">Tidak ada item dalam pesanan ini.</p>
                  )}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    {/* Menggunakan order.total_price dari OrderWithItemsResponse */}
                    <span>{formatPrice(order.total_price)}</span>
                  </div>

                  {/* Asumsi: discount dan shipping akan ditambahkan ke OrderWithItemsResponse jika diperlukan di UI */}
                  {/* Untuk saat ini, jika tidak ada di backend, properti ini akan `undefined` */}
                  {order.discount > 0 && ( // Contoh, jika order memiliki `discount` properti
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>Ongkos Kirim</span>
                    <span>
                      {order.shipping === 0 ? ( // Contoh, jika order memiliki `shipping` properti
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        formatPrice(order.shipping)
                      )}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Pembayaran</span>
                    <span>{formatPrice(order.total_price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info - Ini harus diisi dari data OrderWithItemsResponse backend */}
            {/* Saat ini OrderWithItemsResponse tidak memiliki deliveryInfo langsung */}
            {/* Anda perlu memperluas OrderModel di backend atau fetch terpisah */}
            {/* Untuk sementara, ini akan kosong setelah refresh halaman */}
            {order.deliveryInfo?.deliveryMethod && (
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
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;