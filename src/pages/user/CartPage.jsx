import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Coffee,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice
  } = useCart();
  const { isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const promoCodes = {
    'WELCOME10': { discount: 0.1, description: 'Diskon 10% untuk member baru' },
    'COFFEE20': { discount: 0.2, description: 'Diskon 20% untuk semua kopi' },
    'FREESHIP': { discount: 0, freeShipping: true, description: 'Gratis ongkos kirim' }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      clearCart();
    }
  };

  const handleApplyPromo = () => {
    setPromoError('');

    if (!promoCode.trim()) {
      setPromoError('Masukkan kode promo');
      return;
    }

    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        ...promo
      });
      setPromoCode('');
    } else {
      setPromoError('Kode promo tidak valid');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  const calculateSubtotal = () => {
    return getTotalPrice();
  };

  const calculateDiscount = () => {
    if (!appliedPromo || !appliedPromo.discount) return 0;
    return calculateSubtotal() * appliedPromo.discount;
  };

  const calculateShipping = () => {
    if (appliedPromo && appliedPromo.freeShipping) return 0;
    return calculateSubtotal() > 100000 ? 0 : 10000;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = calculateShipping();
    return subtotal - discount + shipping;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    setIsLoading(true);

    navigate('/checkout', {
      state: {
        cartItems,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        shipping: calculateShipping(),
        total: calculateTotal(),
        appliedPromo
      }
    });
    setIsLoading(false); // Selesai loading untuk navigasi
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'Rp 0'; // Handle non-numeric
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const CartItem = ({ item }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Coffee Image */}
          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
            {item.coffee?.image_url ? ( // Gunakan image_url dari item.coffee
              <img src={item.coffee.image_url} alt={item.coffee.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Coffee className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Item Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{item.coffee.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.coffee.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Variants */}
            {item.variants && item.variants.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.variants.map((variant, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {variant.name}
                    {variant.additional_price > 0 && (
                      <span className="ml-1">+{formatPrice(variant.additional_price)}</span>
                    )}
                  </Badge>
                ))}
              </div>
            )}

            {/* Price and Quantity */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.coffee.price + (item.variants?.reduce((sum, v) => sum + (v.additional_price || 0), 0) || 0))} x {item.quantity}
                </p>
                <p className="font-bold text-primary">
                  {formatPrice(item.subtotal)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Jika belum terautentikasi, tampilkan loading atau null dan biarkan useEffect me-redirect
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-muted-foreground">Mengecek autentikasi...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/menu')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Lanjut Belanja
        </Button>

        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
            <p className="text-muted-foreground">
              {getTotalItems()} item dalam keranjang
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Keranjang Kosong</h2>
              <p className="text-muted-foreground">
                Belum ada item di keranjang Anda. Yuk, mulai pilih kopi favorit!
              </p>
              <Button size="lg" onClick={() => navigate('/menu')}>
                <Coffee className="mr-2 h-4 w-4" />
                Jelajahi Menu
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Item Pesanan</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Kosongkan Keranjang
                </Button>
              </div>

              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kode Promo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appliedPromo ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">
                              {appliedPromo.code}
                            </span>
                          </div>
                          <p className="text-sm text-green-600">
                            {appliedPromo.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemovePromo}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Masukkan kode promo"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                        />
                        <Button onClick={handleApplyPromo}>
                          Terapkan
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-sm text-red-500">{promoError}</p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        <p>Kode promo tersedia:</p>
                        <p>• WELCOME10 - Diskon 10%</p>
                        <p>• COFFEE20 - Diskon 20%</p>
                        <p>• FREESHIP - Gratis ongkir</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({getTotalItems()} item)</span>
                      <span>{formatPrice(calculateSubtotal())}</span>
                    </div>

                    {appliedPromo && appliedPromo.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon ({appliedPromo.code})</span>
                        <span>-{formatPrice(calculateDiscount())}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Ongkos Kirim</span>
                      <span>
                        {calculateShipping() === 0 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          formatPrice(calculateShipping())
                        )}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  {calculateSubtotal() < 100000 && !appliedPromo?.freeShipping && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Belanja {formatPrice(100000 - calculateSubtotal())} lagi untuk gratis ongkir!
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isLoading || cartItems.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Lanjut ke Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/menu')}
                      className="text-sm"
                    >
                      <ArrowLeft className="mr-2 h-3 w-3" />
                      Lanjut Belanja
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Pembayaran Aman</p>
                      <p className="text-muted-foreground">
                        Transaksi Anda dilindungi dengan enkripsi SSL dan sistem pembayaran QRIS yang aman.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;