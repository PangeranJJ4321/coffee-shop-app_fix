import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../../contexts/CartContext';
import { 
  Coffee, 
  Star, 
  Clock, 
  MapPin, 
  Phone,
  ArrowRight,
  ShoppingCart,
  Heart
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [featuredCoffees, setFeaturedCoffees] = useState([]);

  // Mock data for featured coffees
  const mockFeaturedCoffees = [
    {
      id: 1,
      name: 'Espresso Premium',
      description: 'Kopi espresso dengan cita rasa yang kuat dan aroma yang menggugah selera',
      price: 25000,
      image: '/api/placeholder/300/200',
      rating: 4.8,
      rating_count: 124,
      is_available: true,
      category: 'Coffee'
    },
    {
      id: 2,
      name: 'Cappuccino Special',
      description: 'Perpaduan sempurna antara espresso, steamed milk, dan foam yang lembut',
      price: 32000,
      image: '/api/placeholder/300/200',
      rating: 4.7,
      rating_count: 89,
      is_available: true,
      category: 'Coffee'
    },
    {
      id: 3,
      name: 'Latte Art',
      description: 'Latte dengan seni foam yang indah, cocok untuk pecinta kopi dan seni',
      price: 35000,
      image: '/api/placeholder/300/200',
      rating: 4.9,
      rating_count: 156,
      is_available: true,
      category: 'Coffee'
    }
  ];

  useEffect(() => {
    setFeaturedCoffees(mockFeaturedCoffees);
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const isOpenNow = () => {
    const hour = currentTime.getHours();
    const day = currentTime.getDay();
    
    // Monday-Friday: 7:00-22:00, Saturday-Sunday: 8:00-23:00
    if (day >= 1 && day <= 5) {
      return hour >= 7 && hour < 22;
    } else {
      return hour >= 8 && hour < 23;
    }
  };

  const getOperatingHours = () => {
    const day = currentTime.getDay();
    if (day >= 1 && day <= 5) {
      return '07:00 - 22:00';
    } else {
      return '08:00 - 23:00';
    }
  };

  const handleAddToCart = (coffee) => {
    addToCart(coffee, [], 1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

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
                        {getOperatingHours()}
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
            {featuredCoffees.map((coffee) => (
              <Card key={coffee.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <Coffee className="h-16 w-16 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{coffee.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{coffee.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({coffee.rating_count})
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
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
            ))}
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
                  Jl. Kopi Nikmat No. 123<br />
                  Jakarta Selatan, 12345
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                <CardTitle className="mb-2">Telepon</CardTitle>
                <CardDescription>
                  +62 21 1234 5678<br />
                  Buka setiap hari
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                <CardTitle className="mb-2">Jam Buka</CardTitle>
                <CardDescription>
                  Senin - Jumat: 07:00 - 22:00<br />
                  Sabtu - Minggu: 08:00 - 23:00
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

