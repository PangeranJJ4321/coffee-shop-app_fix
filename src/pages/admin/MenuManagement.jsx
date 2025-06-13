import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Coffee, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Upload,
  Star,
  Eye,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Package,
  Image as ImageIcon,
  Tag
} from 'lucide-react';

const MenuManagement = () => {
  const { user: currentUser } = useAuth();
  
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    price: 0,
    category: 'COFFEE',
    status: 'ACTIVE',
    featured: false,
    image: '',
    tags: [],
    variants: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Mock menu data
  const mockMenuItems = [
    {
      id: 1,
      name: 'Espresso Premium',
      description: 'Kopi espresso berkualitas tinggi dengan rasa yang kuat',
      longDescription: 'Espresso premium dibuat dari biji kopi arabica pilihan yang dipanggang dengan sempurna. Menghasilkan rasa yang kuat, aroma yang harum, dan crema yang sempurna. Cocok untuk pecinta kopi sejati yang menginginkan pengalaman kopi autentik.',
      price: 25000,
      category: 'COFFEE',
      status: 'ACTIVE',
      featured: true,
      image: '/images/espresso.jpg',
      rating: 4.8,
      totalReviews: 156,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      tags: ['premium', 'strong', 'arabica'],
      variants: [1, 2, 3] // Size, Sugar, Temperature
    },
    {
      id: 2,
      name: 'Cappuccino Special',
      description: 'Cappuccino dengan foam susu yang sempurna',
      longDescription: 'Cappuccino special adalah perpaduan sempurna antara espresso, steamed milk, dan milk foam. Dibuat dengan teknik barista profesional untuk menghasilkan tekstur yang creamy dan rasa yang seimbang. Disajikan dengan latte art yang indah.',
      price: 32000,
      category: 'COFFEE',
      status: 'ACTIVE',
      featured: true,
      image: '/images/cappuccino.jpg',
      rating: 4.7,
      totalReviews: 203,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      tags: ['creamy', 'milk', 'latte-art'],
      variants: [1, 2, 3, 4] // Size, Sugar, Temperature, Milk
    },
    {
      id: 3,
      name: 'Latte Art',
      description: 'Latte dengan seni foam yang menawan',
      longDescription: 'Latte art adalah kombinasi espresso dan steamed milk yang disajikan dengan seni foam yang menawan. Setiap cangkir dibuat dengan penuh perhatian untuk menciptakan pola yang unik dan Instagram-worthy. Rasa yang smooth dan creamy.',
      price: 35000,
      category: 'COFFEE',
      status: 'ACTIVE',
      featured: false,
      image: '/images/latte.jpg',
      rating: 4.9,
      totalReviews: 89,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      tags: ['art', 'smooth', 'instagram'],
      variants: [1, 2, 3, 4]
    },
    {
      id: 4,
      name: 'Americano',
      description: 'Kopi hitam klasik dengan rasa yang bold',
      longDescription: 'Americano adalah kopi hitam klasik yang dibuat dengan menambahkan air panas ke dalam shot espresso. Menghasilkan rasa yang bold namun tidak terlalu kuat, cocok untuk dinikmati sepanjang hari. Pilihan sempurna untuk yang menyukai kopi tanpa susu.',
      price: 22000,
      category: 'COFFEE',
      status: 'ACTIVE',
      featured: false,
      image: '/images/americano.jpg',
      rating: 4.5,
      totalReviews: 134,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      tags: ['black', 'bold', 'classic'],
      variants: [1, 2, 3]
    },
    {
      id: 5,
      name: 'Iced Coffee Delight',
      description: 'Kopi dingin yang menyegarkan',
      longDescription: 'Iced coffee delight adalah minuman kopi dingin yang sempurna untuk cuaca panas. Dibuat dengan cold brew method untuk menghasilkan rasa yang smooth dan less acidic. Disajikan dengan es batu dan dapat ditambahkan susu sesuai selera.',
      price: 28000,
      category: 'ICED',
      status: 'ACTIVE',
      featured: true,
      image: '/images/iced-coffee.jpg',
      rating: 4.6,
      totalReviews: 178,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      tags: ['cold', 'refreshing', 'summer'],
      variants: [1, 2, 4]
    },
    {
      id: 6,
      name: 'Hot Chocolate',
      description: 'Cokelat panas yang creamy dan manis',
      longDescription: 'Hot chocolate premium dibuat dari cokelat berkualitas tinggi yang dilelehkan dengan susu segar. Menghasilkan minuman yang creamy, manis, dan menghangatkan. Cocok untuk anak-anak dan dewasa yang tidak minum kopi.',
      price: 30000,
      category: 'NON_COFFEE',
      status: 'ACTIVE',
      featured: false,
      image: '/images/hot-chocolate.jpg',
      rating: 4.4,
      totalReviews: 92,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      tags: ['chocolate', 'sweet', 'kids-friendly'],
      variants: [1, 2, 3]
    },
    {
      id: 7,
      name: 'Green Tea Latte',
      description: 'Teh hijau dengan susu yang menenangkan',
      longDescription: 'Green tea latte adalah perpaduan teh hijau matcha premium dengan steamed milk. Menghasilkan rasa yang unik, sedikit pahit dari matcha namun seimbang dengan creamy milk. Kaya akan antioksidan dan memberikan energi yang stabil.',
      price: 33000,
      category: 'NON_COFFEE',
      status: 'INACTIVE',
      featured: false,
      image: '/images/green-tea-latte.jpg',
      rating: 4.3,
      totalReviews: 67,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      tags: ['matcha', 'healthy', 'antioxidant'],
      variants: [1, 2, 3, 4]
    }
  ];

  const categories = [
    { value: 'COFFEE', label: 'Coffee', color: 'bg-brown-100 text-brown-800' },
    { value: 'ICED', label: 'Iced Drinks', color: 'bg-blue-100 text-blue-800' },
    { value: 'NON_COFFEE', label: 'Non Coffee', color: 'bg-green-100 text-green-800' }
  ];

  const statuses = [
    { value: 'ACTIVE', label: 'Aktif', color: 'bg-green-100 text-green-800' },
    { value: 'INACTIVE', label: 'Tidak Aktif', color: 'bg-red-100 text-red-800' }
  ];

  // Mock variants for selection
  const availableVariants = [
    { id: 1, name: 'Size', type: 'SIZE' },
    { id: 2, name: 'Sugar Level', type: 'SUGAR' },
    { id: 3, name: 'Temperature', type: 'TEMPERATURE' },
    { id: 4, name: 'Milk Type', type: 'MILK' },
    { id: 5, name: 'Extra Shot', type: 'ADDON' }
  ];

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setMenuItems(mockMenuItems);
      setFilteredMenuItems(mockMenuItems);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...menuItems];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Sort menu items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.totalReviews - a.totalReviews;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredMenuItems(filtered);
  }, [menuItems, searchTerm, categoryFilter, statusFilter, sortBy]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'price' ? parseInt(value) || 0 : value)
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleVariantChange = (variantId, checked) => {
    setFormData(prev => ({
      ...prev,
      variants: checked 
        ? [...prev.variants, variantId]
        : prev.variants.filter(id => id !== variantId)
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama menu wajib diisi';
    }

    if (!formData.description.trim()) {
      errors.description = 'Deskripsi wajib diisi';
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'Harga harus lebih dari 0';
    }

    if (!formData.category) {
      errors.category = 'Kategori wajib dipilih';
    }

    return errors;
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newMenuItem = {
        id: Date.now(),
        ...formData,
        rating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setMenuItems(prev => [newMenuItem, ...prev]);
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        longDescription: '',
        price: 0,
        category: 'COFFEE',
        status: 'ACTIVE',
        featured: false,
        image: '',
        tags: [],
        variants: []
      });
      setFormErrors({});
      
    } catch (error) {
      setFormErrors({ general: 'Gagal menambahkan menu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMenuItem = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMenuItems(prev => prev.map(item =>
        item.id === selectedMenuItem.id
          ? { ...item, ...formData, updatedAt: new Date().toISOString() }
          : item
      ));

      setIsEditDialogOpen(false);
      setSelectedMenuItem(null);
      setFormData({
        name: '',
        description: '',
        longDescription: '',
        price: 0,
        category: 'COFFEE',
        status: 'ACTIVE',
        featured: false,
        image: '',
        tags: [],
        variants: []
      });
      setFormErrors({});
      
    } catch (error) {
      setFormErrors({ general: 'Gagal mengupdate menu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenuItem = async () => {
    if (!menuItemToDelete) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMenuItems(prev => prev.filter(item => item.id !== menuItemToDelete.id));
      setIsDeleteDialogOpen(false);
      setMenuItemToDelete(null);
      
    } catch (error) {
      alert('Gagal menghapus menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setFormData({
      name: menuItem.name,
      description: menuItem.description,
      longDescription: menuItem.longDescription,
      price: menuItem.price,
      category: menuItem.category,
      status: menuItem.status,
      featured: menuItem.featured,
      image: menuItem.image,
      tags: [...menuItem.tags],
      variants: [...menuItem.variants]
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (menuItem) => {
    setMenuItemToDelete(menuItem);
    setIsDeleteDialogOpen(true);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = categories.find(c => c.value === category);
    return (
      <Badge className={`${categoryConfig.color} border-0`}>
        <Coffee className="h-3 w-3 mr-1" />
        {categoryConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = statuses.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig.color} border-0`}>
        {status === 'ACTIVE' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
        {statusConfig.label}
      </Badge>
    );
  };

  const MenuFormDialog = ({ isEdit = false, isOpen, onOpenChange, onSubmit }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Menu' : 'Tambah Menu Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update informasi menu' : 'Masukkan informasi menu baru'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-6">
          {formErrors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formErrors.general}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Menu *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Espresso Premium"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Singkat *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Deskripsi singkat menu..."
                  rows={3}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Deskripsi Lengkap</Label>
                <Textarea
                  id="longDescription"
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  placeholder="Deskripsi lengkap menu untuk halaman detail..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="25000"
                    className={formErrors.price ? 'border-red-500' : ''}
                  />
                  {formErrors.price && (
                    <p className="text-sm text-red-500">{formErrors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="text-sm text-red-500">{formErrors.category}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured">Menu Unggulan</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="featured"
                      name="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                    />
                    <Label htmlFor="featured" className="text-sm">
                      Tampilkan sebagai menu unggulan
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL Gambar</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Tags Section */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Tags</Label>
                
                {/* Add New Tag */}
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Tambah tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tags List */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Variants Section */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Variant yang Tersedia</Label>
                <div className="space-y-2">
                  {availableVariants.map((variant) => (
                    <div key={variant.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`variant-${variant.id}`}
                        checked={formData.variants.includes(variant.id)}
                        onCheckedChange={(checked) => handleVariantChange(variant.id, checked)}
                      />
                      <Label htmlFor={`variant-${variant.id}`} className="text-sm">
                        {variant.name} ({variant.type})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Tambah'} Menu
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Coffee className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat data menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Menu</h1>
            <p className="text-muted-foreground">
              Kelola menu kopi dan minuman
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Menu
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Coffee className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{menuItems.length}</p>
                  <p className="text-sm text-muted-foreground">Total Menu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {menuItems.filter(item => item.status === 'ACTIVE').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Menu Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {menuItems.filter(item => item.featured).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Menu Unggulan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatPrice(menuItems.reduce((avg, item) => avg + item.price, 0) / menuItems.length || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Harga Rata-rata</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama menu, deskripsi, atau tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="name">Nama A-Z</SelectItem>
                  <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                  <SelectItem value="price_low">Harga Terendah</SelectItem>
                  <SelectItem value="rating">Rating Tertinggi</SelectItem>
                  <SelectItem value="reviews">Review Terbanyak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Menampilkan {filteredMenuItems.length} dari {menuItems.length} menu
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
          </CardContent>
        </Card>

        {/* Menu Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Menu</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-8">
                <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak ada menu ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}>
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Menu</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMenuItems.map((menuItem) => (
                      <TableRow key={menuItem.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                              {menuItem.image ? (
                                <img 
                                  src={menuItem.image} 
                                  alt={menuItem.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{menuItem.name}</p>
                                {menuItem.featured && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Unggulan
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {menuItem.description}
                              </p>
                              {menuItem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {menuItem.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {menuItem.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{menuItem.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getCategoryBadge(menuItem.category)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(menuItem.price)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(menuItem.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{menuItem.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({menuItem.totalReviews})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(menuItem.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditDialog(menuItem)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(menuItem)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Menu Dialog */}
        <MenuFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddMenuItem}
        />

        {/* Edit Menu Dialog */}
        <MenuFormDialog
          isEdit={true}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditMenuItem}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Menu</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus menu "{menuItemToDelete?.name}"? 
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="destructive" 
                onClick={handleDeleteMenuItem}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus Menu
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MenuManagement;
