import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coffee, 
  Search, 
  Star, 
  ShoppingCart, 
  Heart, 
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List
} from 'lucide-react';

const MenuPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [coffees, setCoffees] = useState([]);
  const [filteredCoffees, setFilteredCoffees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for coffee items
  const mockCoffees = [
    {
      id: 1,
      name: 'Espresso Premium',
      description: 'Kopi espresso dengan cita rasa yang kuat dan aroma yang menggugah selera. Dibuat dari biji kopi arabica pilihan yang dipanggang sempurna.',
      price: 25000,
      image: '/api/placeholder/300/200',
      rating: 4.8,
      rating_count: 124,
      is_available: true,
      category: 'Coffee',
      tags: ['strong', 'classic', 'arabica']
    },
    {
      id: 2,
      name: 'Cappuccino Special',
      description: 'Perpaduan sempurna antara espresso, steamed milk, dan foam yang lembut. Cocok untuk pecinta kopi dengan rasa yang seimbang.',
      price: 32000,
      image: '/api/placeholder/300/200',
      rating: 4.7,
      rating_count: 89,
      is_available: true,
      category: 'Coffee',
      tags: ['milk', 'foam', 'balanced']
    },
    {
      id: 3,
      name: 'Latte Art',
      description: 'Latte dengan seni foam yang indah, cocok untuk pecinta kopi dan seni. Menggunakan susu premium dan teknik barista profesional.',
      price: 35000,
      image: '/api/placeholder/300/200',
      rating: 4.9,
      rating_count: 156,
      is_available: true,
      category: 'Coffee',
      tags: ['art', 'milk', 'premium']
    },
    {
      id: 4,
      name: 'Americano',
      description: 'Kopi hitam klasik dengan rasa yang bold dan clean. Dibuat dengan menambahkan air panas ke dalam espresso shot.',
      price: 22000,
      image: '/api/placeholder/300/200',
      rating: 4.5,
      rating_count: 67,
      is_available: true,
      category: 'Coffee',
      tags: ['black', 'classic', 'bold']
    },
    {
      id: 5,
      name: 'Mocha Delight',
      description: 'Kombinasi sempurna antara kopi, cokelat, dan susu. Cocok untuk yang menyukai rasa manis dan creamy.',
      price: 38000,
      image: '/api/placeholder/300/200',
      rating: 4.6,
      rating_count: 98,
      is_available: true,
      category: 'Coffee',
      tags: ['chocolate', 'sweet', 'creamy']
    },
    {
      id: 6,
      name: 'Iced Coffee',
      description: 'Kopi dingin yang menyegarkan, perfect untuk cuaca panas. Disajikan dengan es batu dan sirup vanilla.',
      price: 28000,
      image: '/api/placeholder/300/200',
      rating: 4.4,
      rating_count: 73,
      is_available: true,
      category: 'Iced',
      tags: ['cold', 'refreshing', 'vanilla']
    },
    {
      id: 7,
      name: 'Matcha Latte',
      description: 'Minuman non-kopi dengan bubuk matcha premium dari Jepang. Creamy dan memiliki rasa yang unik.',
      price: 33000,
      image: '/api/placeholder/300/200',
      rating: 4.3,
      rating_count: 45,
      is_available: true,
      category: 'Non-Coffee',
      tags: ['matcha', 'japanese', 'healthy']
    },
    {
      id: 8,
      name: 'Hot Chocolate',
      description: 'Cokelat panas yang rich dan creamy, cocok untuk anak-anak dan pecinta cokelat. Topped dengan whipped cream.',
      price: 30000,
      image: '/api/placeholder/300/200',
      rating: 4.7,
      rating_count: 82,
      is_available: false,
      category: 'Non-Coffee',
      tags: ['chocolate', 'kids', 'sweet']
    }
  ];

  const categories = [
    { value: 'all', label: 'Semua Menu' },
    { value: 'Coffee', label: 'Kopi' },
    { value: 'Iced', label: 'Minuman Dingin' },
    { value: 'Non-Coffee', label: 'Non-Kopi' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Nama' },
    { value: 'price', label: 'Harga' },
    { value: 'rating', label: 'Rating' },
    { value: 'rating_count', label: 'Popularitas' }
  ];

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setCoffees(mockCoffees);
      setFilteredCoffees(mockCoffees);
      setIsLoading(false);
    }, 1000);

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    let filtered = [...coffees];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(coffee =>
        coffee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coffee.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coffee.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(coffee => coffee.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCoffees(filtered);
  }, [coffees, searchTerm, selectedCategory, sortBy, sortOrder]);

  const handleAddToCart = (coffee) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(coffee, [], 1);
  };

  const toggleFavorite = (coffeeId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const newFavorites = favorites.includes(coffeeId)
      ? favorites.filter(id => id !== coffeeId)
      : [...favorites, coffeeId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const CoffeeCard = ({ coffee, isGridView = true }) => (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${!coffee.is_available ? 'opacity-60' : ''} ${isGridView ? '' : 'flex flex-row'}`}>
      <CardHeader className={`p-0 ${isGridView ? '' : 'w-48 flex-shrink-0'}`}>
        <div className={`${isGridView ? 'aspect-video' : 'aspect-square'} bg-muted rounded-t-lg ${isGridView ? '' : 'rounded-l-lg rounded-t-none'} flex items-center justify-center relative overflow-hidden`}>
          <Coffee className="h-16 w-16 text-muted-foreground" />
          {!coffee.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Tidak Tersedia</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={`p-4 flex-1 ${isGridView ? '' : 'flex flex-col justify-between'}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className={`${isGridView ? 'text-lg' : 'text-xl'} group-hover:text-primary transition-colors`}>
                {coffee.name}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{coffee.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({coffee.rating_count})
                </span>
              </div>
              <Badge variant="outline" className="w-fit">
                {coffee.category}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleFavorite(coffee.id)}
              className="flex-shrink-0"
            >
              <Heart 
                className={`h-4 w-4 ${favorites.includes(coffee.id) ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
          </div>
          
          <CardDescription className={`text-sm ${isGridView ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {coffee.description}
          </CardDescription>
          
          <div className="flex flex-wrap gap-1">
            {coffee.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className={`flex items-center ${isGridView ? 'justify-between' : 'justify-between mt-4'}`}>
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Coffee className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Menu Kopi Kami</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Jelajahi koleksi kopi premium kami yang dibuat dengan biji kopi pilihan dan racikan barista profesional
        </p>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kopi, deskripsi, atau tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
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
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Menampilkan {filteredCoffees.length} dari {coffees.length} menu
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

      {/* Coffee Grid/List */}
      {filteredCoffees.length === 0 ? (
        <div className="text-center py-12">
          <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Tidak ada menu ditemukan</h3>
          <p className="text-muted-foreground mb-4">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }}>
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredCoffees.map((coffee) => (
            <CoffeeCard 
              key={coffee.id} 
              coffee={coffee} 
              isGridView={viewMode === 'grid'} 
            />
          ))}
        </div>
      )}

      {/* Load More Button (for pagination in real app) */}
      {filteredCoffees.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;

