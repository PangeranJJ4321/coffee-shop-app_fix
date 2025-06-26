// src/pages/user/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext'; 
import { 
  Coffee, 
  Star, 
  Clock, 
  MapPin, 
  Phone,
  ArrowRight,
  ShoppingCart,
  Heart,
  Loader2, // Tambah loader
  AlertTriangle // Tambah untuk pesan error
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Import Alert


const COFFEE_SHOP_ID = "ed634a6f-c12d-4ed4-8975-1926a2ee4a43"; 

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { api, user, isAuthenticated, toggleFavorite } = useAuth(); 

  const [coffeeShopInfo, setCoffeeShopInfo] = useState(null);
  const [operatingHours, setOperatingHours] = useState([]);
  const [featuredCoffees, setFeaturedCoffees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');


  const fetchHomePageData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Ambil info Coffee Shop
      const shopInfoResponse = await api.get(`/coffee-shops/${COFFEE_SHOP_ID}`);
      setCoffeeShopInfo(shopInfoResponse.data);

      // 2. Ambil jam operasional
      const operatingHoursResponse = await api.get(`/admin/booking-management/coffee-shops/${COFFEE_SHOP_ID}/operating-hours`);
      setOperatingHours(operatingHoursResponse.data);

      // 3. Ambil menu pilihan (featured). Disini kita ambil top 3 popular items dari analytics
      const popularItemsResponse = await api.get(`/admin/analytics/popular-items?coffee_shop_id=${COFFEE_SHOP_ID}&limit=3`);
      const featuredCoffeeIds = popularItemsResponse.data.popular_items.map(item => item.coffee_id);

      // Fetch detail untuk setiap item populer
      const fetchedFeaturedCoffees = [];
      for (const coffeeId of featuredCoffeeIds) {
        try {
          const coffeeDetailResponse = await api.get(`/menu/coffee/${coffeeId}`);
          fetchedFeaturedCoffees.push(coffeeDetailResponse.data); // Ini adalah CoffeeMenuDetailResponse
        } catch (detailErr) {
          console.warn(`Failed to fetch detail for featured coffee ID ${coffeeId}:`, detailErr.response?.data || detailErr.message);
        }
      }
      
      // Fallback jika tidak ada item populer atau ada masalah fetching detail
      if (fetchedFeaturedCoffees.length === 0) {
        const allMenuResponse = await api.get(`/menu/coffee-shops/${COFFEE_SHOP_ID}/menu?sort_by=name&sort_order=asc&limit=3`);
        setFeaturedCoffees(allMenuResponse.data);
      } else {
        setFeaturedCoffees(fetchedFeaturedCoffees);
      }

    } catch (err) {
      console.error("Failed to fetch home page data:", err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Gagal memuat data beranda. Silakan coba lagi nanti.');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2500)
    }
  }, [api]); // `api` sebagai dependency agar useCallback tidak membuat fungsi baru terus

  useEffect(() => {
    fetchHomePageData();
  }, [fetchHomePageData]);


  const isOpenNow = () => {
    if (!operatingHours.length) return false;

    const currentTime = new Date();
    const currentDay = currentTime.getDay(); 
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // Mapping Day to WeekDay enum values used in backend
    const dayMap = {
      0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
      4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY'
    };
    const todayOperatingHours = operatingHours.find(oh => oh.day === dayMap[currentDay]);

    if (!todayOperatingHours || !todayOperatingHours.is_open) return false;

    // Convert time strings (HH:MM:SS) to Date objects for comparison
    const [openHour, openMinute] = todayOperatingHours.opening_time.split(':').map(Number);
    const [closeHour, closeMinute] = todayOperatingHours.closing_time.split(':').map(Number);

    const openTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), openHour, openMinute);
    const closeTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), closeHour, closeMinute);

    return currentTime >= openTime && currentTime < closeTime;
  };

  const getOperatingHoursText = () => {
    if (!operatingHours.length) return 'Tidak ada info jam operasional';

    const currentDay = new Date().getDay();
    const dayMap = {
      0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
      4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY'
    };
    const todayOperatingHours = operatingHours.find(oh => oh.day === dayMap[currentDay]);

    if (todayOperatingHours && todayOperatingHours.is_open) {
      // Format waktu menjadi HH:MM
      const formatTime = (timeStr) => timeStr.substring(0, 5); 
      return `${formatTime(todayOperatingHours.opening_time)} - ${formatTime(todayOperatingHours.closing_time)}`;
    }
    return 'Tutup Hari Ini';
  };


  const handleAddToCart = (coffee) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Jika dari HomePage, asumsikan tanpa varian, karena tidak ada pilihan varian di sini.
    // Pengguna harus ke detail page untuk memilih varian.
    addToCart(coffee, [], 1);
    alert(`"${coffee.name}" berhasil ditambahkan ke keranjang!`); // Notifikasi sederhana
  };

  const handleFavoriteToggle = async (coffeeId, isCurrentlyFavorite) => {
    if (!isAuthenticated) {
        navigate('/login');
        return;
    }
    const result = await toggleFavorite(coffeeId, isCurrentlyFavorite);
    if (result.success) {
      // `user.favorites` di AuthContext akan diperbarui secara otomatis setelah toggleFavorite
      // UI akan re-render dengan status favorit yang baru.
    } else {
      // Tangani error dari toggleFavorite
      setError(result.error || 'Gagal mengubah status favorit.');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Coffee className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat data beranda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} className="mt-4">Muat Ulang Halaman</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Coffee className="h-3 w-3 mr-1" />
                  Kopi Berkualitas Premium
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  Nikmati Kopi
                  <span className="text-primary block">Terbaik Kami</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  Rasakan pengalaman kopi yang tak terlupakan dengan biji kopi pilihan 
                  dan racikan barista profesional kami.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/menu')}>
                  Lihat Menu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/orders')}>
                  Riwayat Pesanan
                </Button>
              </div>

              {/* Operating Hours */}
              <Card className="w-fit">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Jam Operasional Hari Ini</span>
                        <Badge variant={isOpenNow() ? 'default' : 'secondary'}>
                          {isOpenNow() ? 'Buka' : 'Tutup'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getOperatingHoursText()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                  <Coffee className="h-32 w-32 text-primary" />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Menu Pilihan</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Coba kopi-kopi terpopuler kami yang telah menjadi favorit pelanggan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCoffees.length === 0 ? (
                <div className="md:col-span-3 text-center py-10">
                    <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Tidak ada kopi pilihan yang ditemukan.</p>
                </div>
            ) : (
                featuredCoffees.map((coffee) => {
                // Cek apakah item ini favorit dari user object
                const isFavorite = user?.favorites?.some(fav => fav.id === coffee.id) || false;
                return (
                    <Card key={coffee.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                        {coffee.image_url ? (
                        <img 
                            src={coffee.image_url} 
                            alt={coffee.name} 
                            className="w-full h-48 object-cover rounded-t-lg" 
                        />
                        ) : (
                        <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                            <Coffee className="h-16 w-16 text-muted-foreground" />
                        </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                            <CardTitle className="text-lg">{coffee.name}</CardTitle>
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{coffee.rating_average ? coffee.rating_average.toFixed(1) : 'N/A'}</span>
                                <span className="text-sm text-muted-foreground">
                                ({coffee.rating_count} reviews)
                                </span>
                            </div>
                            </div>
                            {isAuthenticated && (
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleFavoriteToggle(coffee.id, isFavorite)}
                            >
                                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            )}
                        </div>
                        
                        <CardDescription className="text-sm">
                            {coffee.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                            {formatPrice(coffee.price)}
                            </span>
                            <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/coffee/${coffee.id}`)}
                            >
                                Detail
                            </Button>
                            <Button 
                                size="sm"
                                onClick={() => handleAddToCart(coffee)}
                                disabled={!coffee.is_available}
                            >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Tambah
                            </Button>
                            </div>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                );
                })
            )}
          </div>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/menu')}>
              Lihat Semua Menu
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                <CardTitle className="mb-2">Lokasi</CardTitle>
                <CardDescription>
                  {coffeeShopInfo?.address || 'Loading...'}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                <CardTitle className="mb-2">Telepon</CardTitle>
                <CardDescription>
                  {coffeeShopInfo?.phone_number || 'Loading...'}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                <CardTitle className="mb-2">Jam Buka</CardTitle>
                <CardDescription>
                  {getOperatingHoursText()}<br />
                  {/* Tambahkan hari jika perlu */}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;