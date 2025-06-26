// src/pages/user/MenuPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Untuk sorting
import { Slider } from '@/components/ui/slider'; // Untuk filter harga
import { Label as ShadcnLabel } from '@/components/ui/label'; // Untuk label slider
import { Alert, AlertDescription } from '@/components/ui/alert'; // Untuk pesan error
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'; // Untuk filter kategori

import { 
  Coffee, 
  Search, 
  Star, 
  ShoppingCart, 
  Heart, 
  Loader2, // Tambah Loader2 untuk spinner
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  ChevronDown // Untuk ikon dropdown
} from 'lucide-react';


const COFFEE_SHOP_ID = "ed634a6f-c12d-4ed4-8975-1926a2ee4a43";

const MenuPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { api, user, isAuthenticated, toggleFavorite } = useAuth(); 

  const [coffees, setCoffees] = useState([]); // Data asli yang difetch dari API
  const [filteredCoffees, setFilteredCoffees] = useState([]); // Data yang ditampilkan setelah filter lokal
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filterParams, setFilterParams] = useState({
    min_price: 0,
    max_price: 100000, // Atur max price yang sesuai dengan rentang harga Anda
    search: '',
    sort_by: 'name',
    sort_order: 'asc',
    rating: 0,
    category: 'all', // Tambah filter kategori
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); 
  const [categories, setCategories] = useState([{ value: 'all', label: 'Semua Menu' }]);


  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(filterParams.search);
    }, 500); // 500ms debounce
    return () => clearTimeout(timerId);
  }, [filterParams.search]);


  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (filterParams.min_price !== 0) queryParams.append('min_price', filterParams.min_price);
      if (filterParams.max_price !== 100000) queryParams.append('max_price', filterParams.max_price); 
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      if (filterParams.sort_by) queryParams.append('sort_by', filterParams.sort_by);
      if (filterParams.sort_order) queryParams.append('sort_order', filterParams.sort_order);
      if (filterParams.rating !== 0) queryParams.append('rating', filterParams.rating);
      if (filterParams.category !== 'all') queryParams.append('category', filterParams.category);

      const response = await api.get(`/menu/coffee-shops/${COFFEE_SHOP_ID}/menu?${queryParams.toString()}`);
      
      setCoffees(response.data); 
      
      const uniqueCategories = [...new Set(response.data.map(item => item.category))].filter(Boolean).map(cat => ({ value: cat, label: cat }));
      setCategories([{ value: 'all', label: 'Semua Menu' }, ...uniqueCategories]);

    } catch (err) {
      console.error("Failed to fetch menu items:", err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Gagal memuat menu kopi. Silakan coba lagi nanti.');
    } finally {
      setTimeout(()=> {
        setIsLoading(false);
      }, 1500)
    }
  }, [api, filterParams.min_price, filterParams.max_price, filterParams.sort_by, filterParams.sort_order, filterParams.rating, filterParams.category, debouncedSearchTerm]);


  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);


  useEffect(() => {
    setFilteredCoffees(coffees); 
  }, [coffees]);


  const handleFilterChange = (name, value) => {
    setFilterParams(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceRangeChange = (value) => {
    setFilterParams(prev => ({ ...prev, min_price: value[0], max_price: value[1] }));
  };

  const handleAddToCart = (coffee) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    

    if (coffee.variants && Object.keys(coffee.variants).length > 0) { 
      navigate(`/coffee/${coffee.id}`); 
    } else {
      addToCart(coffee, [], 1); // Tambah ke keranjang tanpa varian
      alert(`"${coffee.name}" berhasil ditambahkan ke keranjang!`);
    }
  };

  const handleFavoriteToggle = async (coffeeId, isCurrentlyFavorite) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const result = await toggleFavorite(coffeeId, isCurrentlyFavorite);
    if (!result.success) {
      setError(result.error);
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

  const CoffeeCard = ({ coffee, isGridView = true }) => {
    const isFavorite = user?.favorites?.some(fav => fav.id === coffee.id) || false; 
    return (
      <Card className={`group hover:shadow-lg transition-all duration-300 ${!coffee.is_available ? 'opacity-60' : ''} ${isGridView ? '' : 'flex flex-row'}`}>
        <CardHeader className={`p-0 ${isGridView ? '' : 'w-48 flex-shrink-0'}`}>
          <div className={`${isGridView ? 'aspect-video' : 'aspect-square'} bg-muted rounded-t-lg ${isGridView ? '' : 'rounded-l-lg rounded-t-none'} flex items-center justify-center relative overflow-hidden`}>
            {coffee.image_url ? (
              <img 
                src={coffee.image_url} 
                alt={coffee.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <Coffee className="h-16 w-16 text-muted-foreground" />
            )}
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
                  <span className="text-sm font-medium">{coffee.rating_average ? coffee.rating_average.toFixed(1) : 'N/A'}</span>
                  <span className="text-sm text-muted-foreground">
                    ({coffee.rating_count} reviews)
                  </span>
                </div>
                {/* Kategori ada di CoffeeMenuPublicResponse */}
                {coffee.category && (
                    <Badge variant="outline" className="w-fit">
                        {coffee.category}
                    </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleFavoriteToggle(coffee.id, isFavorite)}
                className="flex-shrink-0"
              >
                <Heart 
                  className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </Button>
            </div>
            
            <CardDescription className={`text-sm ${isGridView ? 'line-clamp-2' : 'line-clamp-3'}`}>
              {coffee.description}
            </CardDescription>
            
            {/* Tags ada di CoffeeMenuPublicResponse */}
            {coffee.tags && coffee.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {coffee.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                    </Badge>
                    ))}
                </div>
            )}
            
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
  };

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

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={fetchMenuItems} className="mt-4">Coba Lagi</Button>
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
              placeholder="Cari kopi, deskripsi..."
              value={filterParams.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Price Range Slider */}
          {/* <div className="space-y-4 hidden md:block"> 
            <div className="flex justify-between items-center">
              <ShadcnLabel>Harga</ShadcnLabel>
              <Badge variant="secondary">
                {formatPrice(filterParams.min_price)} - {formatPrice(filterParams.max_price)}
              </Badge>
            </div>
            <Slider
              min={0}
              max={100000} // Sesuaikan dengan rentang harga data Anda
              step={1000}
              value={[filterParams.min_price, filterParams.max_price]}
              onValueChange={handlePriceRangeChange}
              range
              className="w-full md:w-48"
            />
          </div> */}

          {/* Category Filter */}
          <Select value={filterParams.category} onValueChange={(val) => handleFilterChange('category', val)}>
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

          {/* Rating Filter (Input Number) */}
          {/* <div className="space-y-2">
            <ShadcnLabel htmlFor="rating">Rating Min</ShadcnLabel>
            <Input
              id="rating"
              type="number"
              min={0}
              max={5}
              step={1}
              value={filterParams.rating}
              onChange={(e) => handleFilterChange('rating', parseInt(e.target.value) || 0)}
              className="w-20"
            />
          </div> */}


          {/* Sort By */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-40 justify-between">
                {filterParams.sort_by === 'name' ? 'Nama' : filterParams.sort_by === 'price' ? 'Harga' : 'Rating'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuRadioGroup
                value={filterParams.sort_by}
                onValueChange={(value) => handleFilterChange('sort_by', value)}
              >
                <DropdownMenuLabel>Urutkan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="name">Nama</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price">Harga</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handleFilterChange('sort_order', filterParams.sort_order === 'asc' ? 'desc' : 'asc')}
          >
            {filterParams.sort_order === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
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
            {filterParams.search && ` untuk "${filterParams.search}"`}
          </span>
          {filterParams.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange('search', '')}
            >
              Hapus pencarian
            </Button>
          )}
        </div>
      </div>

      {/* Coffee Grid/List */}
      {filteredCoffees.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Tidak ada menu ditemukan</h3>
          <p className="text-muted-foreground mb-4">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
          <Button onClick={() => {
            setFilterParams({ // Reset semua filter
              min_price: 0,
              max_price: 100000,
              search: '',
              sort_by: 'name',
              sort_order: 'asc',
              rating: 0,
              category: 'all',
            });
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
      {/* Jika Anda memiliki pagination di backend, ini akan relevan */}
      {/* filteredCoffees.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Muat Lebih Banyak
          </Button>
        </div>
      ) */}
    </div>
  );
};

export default MenuPage;