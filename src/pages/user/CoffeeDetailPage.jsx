import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coffee, 
  Star, 
  Heart, 
  ShoppingCart, 
  Plus, 
  Minus, 
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

const CoffeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [coffee, setCoffee] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for coffee detail
  const mockCoffee = {
    id: parseInt(id),
    name: 'Espresso Premium',
    description: 'Kopi espresso dengan cita rasa yang kuat dan aroma yang menggugah selera. Dibuat dari biji kopi arabica pilihan yang dipanggang sempurna dengan teknik roasting tradisional Italia.',
    long_description: 'Espresso Premium kami adalah hasil dari perpaduan sempurna antara tradisi dan inovasi. Menggunakan biji kopi arabica grade A yang dipetik langsung dari perkebunan terbaik di dataran tinggi Jawa Barat. Proses roasting dilakukan dengan hati-hati untuk menghasilkan profil rasa yang kompleks dengan notes cokelat gelap, karamel, dan sedikit sentuhan buah-buahan. Setiap shot espresso diekstrak dengan presisi menggunakan mesin espresso profesional untuk menghasilkan crema yang sempurna.',
    price: 25000,
    image: '/api/placeholder/600/400',
    rating: 4.8,
    rating_count: 124,
    is_available: true,
    category: 'Coffee',
    tags: ['strong', 'classic', 'arabica', 'premium'],
    preparation_time: '3-5 menit',
    caffeine_content: 'Tinggi',
    origin: 'Jawa Barat, Indonesia',
    roast_level: 'Medium Dark'
  };

  // Mock variant types and variants
  const mockVariantTypes = [
    {
      id: 1,
      name: 'Size',
      variants: [
        { id: 1, name: 'Small', additional_price: 0 },
        { id: 2, name: 'Medium', additional_price: 5000 },
        { id: 3, name: 'Large', additional_price: 10000 }
      ]
    },
    {
      id: 2,
      name: 'Sugar Level',
      variants: [
        { id: 4, name: 'No Sugar', additional_price: 0 },
        { id: 5, name: 'Less Sugar', additional_price: 0 },
        { id: 6, name: 'Normal Sugar', additional_price: 0 },
        { id: 7, name: 'Extra Sugar', additional_price: 2000 }
      ]
    },
    {
      id: 3,
      name: 'Milk Type',
      variants: [
        { id: 8, name: 'No Milk', additional_price: 0 },
        { id: 9, name: 'Regular Milk', additional_price: 3000 },
        { id: 10, name: 'Oat Milk', additional_price: 8000 },
        { id: 11, name: 'Almond Milk', additional_price: 10000 }
      ]
    }
  ];

  // Mock reviews
  const mockReviews = [
    {
      id: 1,
      user_name: 'Ahmad Rizki',
      rating: 5,
      comment: 'Espresso terbaik yang pernah saya coba! Rasa yang kuat dan aroma yang menggugah selera. Highly recommended!',
      created_at: '2024-01-15',
      avatar: null
    },
    {
      id: 2,
      user_name: 'Sarah Putri',
      rating: 4,
      comment: 'Kopi yang enak, tapi mungkin terlalu strong untuk saya. Overall masih bagus sih.',
      created_at: '2024-01-10',
      avatar: null
    },
    {
      id: 3,
      user_name: 'Budi Santoso',
      rating: 5,
      comment: 'Perfect! Crema-nya bagus, rasa balanced. Pasti akan order lagi.',
      created_at: '2024-01-08',
      avatar: null
    }
  ];

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setCoffee(mockCoffee);
      setReviews(mockReviews);
      
      // Initialize default variants
      const defaultVariants = {};
      mockVariantTypes.forEach(variantType => {
        defaultVariants[variantType.name] = variantType.variants[0];
      });
      setSelectedVariants(defaultVariants);
      
      setIsLoading(false);
    }, 1000);

    // Check if item is in favorites
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(parseInt(id)));
  }, [id]);

  const handleVariantChange = (variantTypeName, variant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantTypeName]: variant
    }));
  };

  const calculateTotalPrice = () => {
    if (!coffee) return 0;
    
    const basePrice = coffee.price;
    const variantPrice = Object.values(selectedVariants).reduce(
      (total, variant) => total + (variant.additional_price || 0), 
      0
    );
    
    return (basePrice + variantPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const variants = Object.values(selectedVariants);
    addToCart(coffee, variants, quantity);
    
    // Show success message or redirect
    alert('Item berhasil ditambahkan ke keranjang!');
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const coffeeId = parseInt(id);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(favId => favId !== coffeeId);
    } else {
      newFavorites = [...favorites, coffeeId];
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('Silakan tulis komentar Anda');
      return;
    }

    setIsSubmittingReview(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const review = {
        id: Date.now(),
        user_name: user.name,
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: new Date().toISOString().split('T')[0],
        avatar: user.avatar
      };
      
      setReviews(prev => [review, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      
      alert('Review berhasil ditambahkan!');
    } catch (error) {
      alert('Gagal menambahkan review');
    } finally {
      setIsSubmittingReview(false);
    }
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
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Coffee className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat detail kopi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!coffee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Kopi tidak ditemukan</h1>
          <Button onClick={() => navigate('/menu')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/menu')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Menu
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Coffee Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <Coffee className="h-32 w-32 text-muted-foreground" />
          </div>
          
          {/* Coffee Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Waktu Persiapan</p>
                <p className="text-xs text-muted-foreground">{coffee.preparation_time}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Coffee className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Kafein</p>
                <p className="text-xs text-muted-foreground">{coffee.caffeine_content}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coffee Details */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{coffee.name}</h1>
                <div className="flex items-center gap-2">
                  {renderStars(coffee.rating)}
                  <span className="text-sm font-medium">{coffee.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({coffee.rating_count} ulasan)
                  </span>
                </div>
                <Badge variant="outline">{coffee.category}</Badge>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleFavorite}
              >
                <Heart 
                  className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
            </div>

            <p className="text-muted-foreground">{coffee.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {coffee.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Variants Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pilih Varian</h3>
            {mockVariantTypes.map((variantType) => (
              <div key={variantType.id} className="space-y-2">
                <Label className="text-sm font-medium">{variantType.name}</Label>
                <Select
                  value={selectedVariants[variantType.name]?.id?.toString()}
                  onValueChange={(value) => {
                    const variant = variantType.variants.find(v => v.id.toString() === value);
                    handleVariantChange(variantType.name, variant);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {variantType.variants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id.toString()}>
                        <div className="flex justify-between items-center w-full">
                          <span>{variant.name}</span>
                          {variant.additional_price > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              +{formatPrice(variant.additional_price)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Jumlah</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Price and Add to Cart */}
          <div className="space-y-4">
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Harga</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(calculateTotalPrice())}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!coffee.is_available}
                  className="flex-1"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Tambah ke Keranjang
                </Button>
              </div>
            </div>
            
            {!coffee.is_available && (
              <Alert variant="destructive">
                <AlertDescription>
                  Maaf, item ini sedang tidak tersedia
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Description and Reviews */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">Deskripsi</TabsTrigger>
          <TabsTrigger value="reviews">
            Ulasan ({reviews.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {coffee.long_description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informasi Produk</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asal:</span>
                      <span>{coffee.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tingkat Roasting:</span>
                      <span>{coffee.roast_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kandungan Kafein:</span>
                      <span>{coffee.caffeine_content}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-6">
          {/* Add Review Form */}
          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle>Tulis Ulasan</CardTitle>
                <CardDescription>
                  Bagikan pengalaman Anda dengan kopi ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    {renderStars(
                      newReview.rating, 
                      true, 
                      (rating) => setNewReview(prev => ({ ...prev, rating }))
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comment">Komentar</Label>
                    <Textarea
                      id="comment"
                      placeholder="Tulis ulasan Anda..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSubmittingReview}>
                    {isSubmittingReview ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Kirim Ulasan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ulasan Pelanggan</h3>
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada ulasan</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {review.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{review.user_name}</h4>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        {renderStars(review.rating)}
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoffeeDetailPage;

