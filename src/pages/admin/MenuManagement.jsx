import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  ImageIcon,
  Tag
} from 'lucide-react';

const MenuManagement = () => {
  const { api } = useAuth();

  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFeaturedFilterActive, setIsFeaturedFilterActive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize constants to prevent re-renders
  const categories = useMemo(() => [
    { value: 'COFFEE', label: 'Coffee', color: 'bg-brown-100 text-brown-800' },
    { value: 'ICED', label: 'Iced Drinks', color: 'bg-blue-100 text-blue-800' },
    { value: 'NON_COFFEE', label: 'Non Coffee', color: 'bg-green-100 text-green-800' }
  ], []);

  const statuses = useMemo(() => [
    { value: 'ACTIVE', label: 'Aktif', color: 'bg-green-100 text-green-800' },
    { value: 'INACTIVE', label: 'Tidak Aktif', color: 'bg-red-100 text-red-800' }
  ], []);


  // Fungsi untuk mengambil data menu dari API
  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/menu-management/menu');
      const mappedItems = response.data.map(item => ({
        ...item,
        status: item.is_available ? 'ACTIVE' : 'INACTIVE', // Konversi boolean ke string status
        tags: item.tags || [],
        rating: item.average_rating || 0, // Menggunakan average_rating dari backend
        totalReviews: item.total_ratings || 0, // Menggunakan total_ratings dari backend
      }));
      setMenuItems(mappedItems);
    } catch (error) {
      console.error("Failed to fetch menu items:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);


  // Memoize filtered menu items to prevent unnecessary re-calculations
  const filteredMenuItems = useMemo(() => {
    let filtered = [...menuItems];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
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
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.totalReviews || 0) - (a.totalReviews || 0);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    if (isFeaturedFilterActive) {
      filtered = filtered.filter(item => item.featured === true);
    }

    return filtered;
  }, [menuItems, searchTerm, categoryFilter, statusFilter, sortBy, isFeaturedFilterActive]);


  const handleAddMenuItem = useCallback(async (formDataFromDialog, setDialogErrors) => {
    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append('name', formDataFromDialog.name);
      formPayload.append('price', formDataFromDialog.price);
      formPayload.append('description', formDataFromDialog.description);
      formPayload.append('long_description', formDataFromDialog.longDescription || '');
      formPayload.append('category', formDataFromDialog.category);
      formPayload.append('is_available', formDataFromDialog.status === 'ACTIVE');
      formPayload.append('featured', formDataFromDialog.featured);
      formPayload.append('coffee_shop_id', 'ed634a6f-c12d-4ed4-8975-1926a2ee4a43');

      if (formDataFromDialog.image_file) {
        formPayload.append('image_file', formDataFromDialog.image_file);
      } else if (formDataFromDialog.image) {
        formPayload.append('image_url', formDataFromDialog.image);
      }

      const response = await api.post('/admin/menu-management/menu', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Menu item added:', response.data);

      await Promise.all(formDataFromDialog.variants.map(async (variantId) => {
        try {
          await api.post('/admin/menu-management/coffee-variants', {
            coffee_id: response.data.id,
            variant_id: variantId,
            is_default: false
          });
        } catch (variantError) {
          console.error(`Failed to add variant ${variantId} to coffee ${response.data.id}:`, variantError);
        }
      }));

      fetchMenuItems();
      setIsAddDialogOpen(false);
      setDialogErrors({});

    } catch (error) {
      console.error("Failed to add menu item:", error.response?.data || error.message);
      setDialogErrors({ general: error.response?.data?.detail || 'Gagal menambahkan menu' });
    } finally {
      setIsSubmitting(false);
    }
  }, [api, fetchMenuItems]);

  const handleEditMenuItem = useCallback(async (formDataFromDialog, setDialogErrors) => {
    if (!selectedMenuItem) return;

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append('name', formDataFromDialog.name);
      formPayload.append('price', formDataFromDialog.price);
      formPayload.append('description', formDataFromDialog.description);
      formPayload.append('long_description', formDataFromDialog.longDescription || '');
      formPayload.append('category', formDataFromDialog.category);
      formPayload.append('is_available', formDataFromDialog.status === 'ACTIVE');
      formPayload.append('featured', formDataFromDialog.featured);
      formPayload.append('coffee_shop_id', formDataFromDialog.coffee_shop_id);

      // Debug logging
      console.log('Featured value being sent:', formDataFromDialog.featured === true ? 'true' : 'false');
      console.log('Featured original value:', formDataFromDialog.featured);
      console.log('Featured type:', typeof formDataFromDialog.featured);

      if (formDataFromDialog.image_file) {
        formPayload.append('image_file', formDataFromDialog.image_file);
        formPayload.append('image_url', '');
      } else if (formDataFromDialog.image !== selectedMenuItem.image_url) {
        formPayload.append('image_url', formDataFromDialog.image || '');
      }

      const currentConnectedVariantIds = selectedMenuItem.variants
        ? Object.values(selectedMenuItem.variants).flat().map(v => v.id)
        : [];
      const variantsToAdd = formDataFromDialog.variants.filter(id => !currentConnectedVariantIds.includes(id));
      const variantsToRemove = currentConnectedVariantIds.filter(id => !formDataFromDialog.variants.includes(id));

      await Promise.all(variantsToRemove.map(async (variantId) => {
        try {
          const coffeeVariantConnections = await api.get(`/admin/menu-management/coffee-variants?coffee_id=${selectedMenuItem.id}&variant_id=${variantId}`);
          if (coffeeVariantConnections.data.length > 0) {
            await api.delete(`/admin/menu-management/coffee-variants/${coffeeVariantConnections.data[0].id}`);
          }
        } catch (error) {
          console.error(`Failed to remove variant ${variantId} from coffee ${selectedMenuItem.id}:`, error);
        }
      }));

      await Promise.all(variantsToAdd.map(async (variantId) => {
        try {
          await api.post('/admin/menu-management/coffee-variants', {
            coffee_id: selectedMenuItem.id,
            variant_id: variantId,
            is_default: false
          });
        } catch (error) {
          console.error(`Failed to add variant ${variantId} to coffee ${selectedMenuItem.id}:`, error);
        }
      }));

      const response = await api.put(`/admin/menu-management/menu/${selectedMenuItem.id}`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Menu item updated:', response.data);
      fetchMenuItems();
      setIsEditDialogOpen(false);
      setSelectedMenuItem(null);
      setDialogErrors({});

    } catch (error) {
      console.error("Failed to update menu item:", error.response?.data || error.message);
      setDialogErrors({ general: error.response?.data?.detail || 'Gagal mengupdate menu' });
    } finally {
      setIsSubmitting(false);
    }
  }, [api, fetchMenuItems, selectedMenuItem]);

  const handleDeleteMenuItem = useCallback(async () => {
    if (!menuItemToDelete) return;

    setIsSubmitting(true);

    try {
      await api.delete(`/admin/menu-management/menu/${menuItemToDelete.id}`);
      console.log('Menu item deleted:', menuItemToDelete.id);
      fetchMenuItems();

      setIsDeleteDialogOpen(false);
      setMenuItemToDelete(null);

    } catch (error) {
      console.error("Failed to delete menu item:", error.response?.data || error.message);
      alert('Gagal menghapus menu: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSubmitting(false);
    }
  }, [menuItemToDelete, api, fetchMenuItems]);

  const openEditDialog = useCallback(async (menuItem) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/menu-management/menu/${menuItem.id}`);
      const detailedMenuItem = response.data;
      setSelectedMenuItem(detailedMenuItem);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Failed to load menu item for edit:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, [api]);


  const openDeleteDialog = useCallback((menuItem) => {
    setMenuItemToDelete(menuItem);
    setIsDeleteDialogOpen(true);
  }, []);

  // Memoize utility functions
  const formatPrice = useCallback((price) => {
    if (typeof price !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString;
    }
  }, []);

  const getCategoryBadge = useCallback((category) => {
    const categoryConfig = categories.find(c => c.value === category);
    return (
      <Badge className={`${categoryConfig?.color || 'bg-gray-100 text-gray-800'} border-0`}>
        <Coffee className="h-3 w-3 mr-1" />
        {categoryConfig?.label || category}
      </Badge>
    );
  }, [categories]);

  const getStatusBadge = useCallback((status) => {
    const statusConfig = statuses.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color || 'bg-gray-100 text-gray-800'} border-0`}>
        {status === 'ACTIVE' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
        {statusConfig?.label || status}
      </Badge>
    );
  }, [statuses]);


  // UserFormDialog will now manage its own state
  const MenuFormDialog = React.memo(({ isEdit = false, isOpen, onOpenChange, onSubmit, initialMenuItem = null }) => {
    const [formData, setFormData] = useState(() => ({
      name: initialMenuItem?.name || '',
      description: initialMenuItem?.description || '',
      longDescription: initialMenuItem?.long_description || '',
      price: initialMenuItem?.price || 0,
      category: initialMenuItem?.category || 'Coffee', // Default to 'Coffee'
      status: initialMenuItem?.is_available ? 'ACTIVE' : 'INACTIVE',
      featured: initialMenuItem?.featured || false,
      image: initialMenuItem?.image_url || '',
      image_file: null,
      tags: initialMenuItem?.tags || [],
      variants: initialMenuItem?.variants ? initialMenuItem.variants.map(v => v.id) : [],
      coffee_shop_id: initialMenuItem?.coffee_shop_id || 'ed634a6f-c12d-4ed4-8975-1926a2ee4a43', // Default or initial value
    }));
    const [formErrors, setFormErrors] = useState({});
    const [newTag, setNewTag] = useState('');
    const [availableVariantTypes, setAvailableVariantTypes] = useState([]);
    const [allAvailableVariants, setAllAvailableVariants] = useState([]);

    const debounceTimeoutRef = useRef(null);

    const fetchAvailableVariantsData = useCallback(async () => {
      try {
        const typesResponse = await api.get('/admin/menu-management/variant-types');
        setAvailableVariantTypes(typesResponse.data);

        const variantsResponse = await api.get('/admin/menu-management/variants');
        setAllAvailableVariants(variantsResponse.data);
      } catch (error) {
        console.error("Failed to fetch available variants data:", error.response?.data || error.message);
      }
    }, [api]);


    useEffect(() => {
      fetchAvailableVariantsData();
    }, [fetchAvailableVariantsData]);

    // Reset form data when dialog opens or initialMenuItem changes
    useEffect(() => {
      if (isOpen) {
        setFormData({
          name: initialMenuItem?.name || '',
          description: initialMenuItem?.description || '',
          longDescription: initialMenuItem?.long_description || '',
          price: initialMenuItem?.price || 0,
          category: initialMenuItem?.category || 'Coffee',
          status: initialMenuItem?.is_available ? 'ACTIVE' : 'INACTIVE',
          featured: initialMenuItem?.featured || false,
          image: initialMenuItem?.image_url || '',
          image_file: null,
          tags: initialMenuItem?.tags || [],
          variants: initialMenuItem?.variants ? initialMenuItem.variants.map(v => v.id) : [],
          coffee_shop_id: initialMenuItem?.coffee_shop_id || 'ed634a6f-c12d-4ed4-8975-1926a2ee4a43',
        });
        setFormErrors({}); // Clear errors when dialog opens
        setNewTag(''); // Clear new tag input
      }
    }, [isOpen, initialMenuItem]);

    const handleInputChange = useCallback((e) => {
      const { name, value, type, checked, files } = e.target;
      if (name === 'image_file') {
        setFormData(prev => ({
          ...prev,
          image_file: files[0],
          image: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : (name === 'price' ? parseInt(value) || 0 : value)
        }));
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (formErrors[name]) {
          setFormErrors(prev => ({
            ...prev,
            [name]: ''
          }));
        }
      }, 300);
    }, [formErrors]);

    const addTag = useCallback(() => {
      if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;

      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }, [newTag, formData.tags]);

    const removeTag = useCallback((tagToRemove) => {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }));
    }, []);

    const handleVariantChange = useCallback((variantId, checked) => {
      setFormData(prev => ({
        ...prev,
        variants: checked
          ? [...prev.variants, variantId]
          : prev.variants.filter(id => id !== variantId)
      }));
    }, []);

    const validateForm = useCallback(() => {
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

      if (!isEdit && !formData.image_file && !formData.image) {
        errors.image = 'Gambar menu wajib diupload atau URL gambar diisi';
      }

      return errors;
    }, [formData, isEdit]);

    const handleSubmit = useCallback(async (e) => {
      e.preventDefault();

      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Pass formData and setFormErrors to the parent's onSubmit function
      await onSubmit(formData, setFormErrors);

    }, [formData, validateForm, onSubmit]);


    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Menu' : 'Tambah Menu Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update informasi menu' : 'Masukkan informasi menu baru'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                      <Label htmlFor="featured">{formData.featured ? 'Ya' : 'Tidak'}</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_file">Gambar Menu</Label>
                  <Input
                    id="image_file"
                    name="image_file"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className={formErrors.image ? 'border-red-500' : ''}
                  />
                  {formErrors.image && (
                    <p className="text-sm text-red-500">{formErrors.image}</p>
                  )}
                  {formData.image && (
                    <p className="text-sm text-muted-foreground mt-1">
                      URL Gambar saat ini: <a href={formData.image} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{formData.image}</a>
                    </p>
                  )}
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
                  {/* Loop melalui tipe varian, lalu varian di dalamnya */}
                  {availableVariantTypes.map(type => (
                    <div key={type.id} className="space-y-2 mb-4 p-3 border rounded-lg bg-muted/50">
                      <p className="font-medium text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4" /> {type.name} ({type.is_required ? 'Wajib' : 'Opsional'})
                      </p>
                      <Separator />
                      <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                        {allAvailableVariants
                          .filter(variant => variant.variant_type_id === type.id)
                          .map(variant => (
                            <div key={variant.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`variant-${variant.id}`}
                                checked={formData.variants.includes(variant.id)}
                                onCheckedChange={(checked) => handleVariantChange(variant.id, checked)}
                                disabled={!variant.is_available} // Disable jika varian tidak tersedia
                              />
                              <Label htmlFor={`variant-${variant.id}`} className={`text-sm cursor-pointer ${!variant.is_available ? 'text-muted-foreground' : ''}`}>
                                {variant.name}
                                {variant.additional_price > 0 && (
                                  <span className="ml-1 text-xs text-primary">
                                    (+{formatPrice(variant.additional_price)})
                                  </span>
                                )}
                                {!variant.is_available && (
                                  <Badge variant="secondary" className="ml-2 text-xs">Tidak Tersedia</Badge>
                                )}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
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
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Batal
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  });


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
          <Button onClick={() => {
            setSelectedMenuItem(null); // Ensure no menu item is selected for add
            setIsAddDialogOpen(true);
          }}>
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

              <Select value={isFeaturedFilterActive ? 'featured' : 'all'} onValueChange={(value) => setIsFeaturedFilterActive(value === 'featured')}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Unggulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Menu</SelectItem>
                  <SelectItem value="featured">Menu Unggulan</SelectItem>
                </SelectContent>
              </Select>

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
                              {menuItem.image_url ? (
                                <img
                                  src={menuItem.image_url}
                                  alt={menuItem.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Coffee className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{menuItem.name}</p>
                                {menuItem.featured && (
                                  <Badge variant="secondary" className="text-xs bg-purple-500 text-white">
                                    <Star className="h-3 w-3 mr-1" />
                                    Unggulan
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {menuItem.description}
                              </p>
                              {menuItem.tags && menuItem.tags.length > 0 && (
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
                            {formatDate(menuItem.created_at)}
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
          initialMenuItem={null}
        />

        {/* Edit Menu Dialog */}
        <MenuFormDialog
          isEdit={true}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditMenuItem}
          initialMenuItem={selectedMenuItem}
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