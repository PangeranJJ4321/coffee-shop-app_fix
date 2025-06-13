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
import { 
  Settings, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Coffee,
  Tag,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Package
} from 'lucide-react';

const VariantManagement = () => {
  const { user: currentUser } = useAuth();
  
  const [variants, setVariants] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SIZE',
    description: '',
    priceModifier: 0,
    status: 'ACTIVE',
    options: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOption, setNewOption] = useState({ name: '', priceModifier: 0 });

  // Mock variant data
  const mockVariants = [
    {
      id: 1,
      name: 'Size',
      type: 'SIZE',
      description: 'Ukuran minuman kopi',
      priceModifier: 0,
      status: 'ACTIVE',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      options: [
        { id: 1, name: 'Small', priceModifier: 0 },
        { id: 2, name: 'Medium', priceModifier: 5000 },
        { id: 3, name: 'Large', priceModifier: 10000 }
      ]
    },
    {
      id: 2,
      name: 'Sugar Level',
      type: 'SUGAR',
      description: 'Tingkat kemanisan',
      priceModifier: 0,
      status: 'ACTIVE',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      options: [
        { id: 4, name: 'No Sugar', priceModifier: 0 },
        { id: 5, name: 'Less Sugar', priceModifier: 0 },
        { id: 6, name: 'Normal Sugar', priceModifier: 0 },
        { id: 7, name: 'Extra Sugar', priceModifier: 0 }
      ]
    },
    {
      id: 3,
      name: 'Milk Type',
      type: 'MILK',
      description: 'Jenis susu untuk kopi',
      priceModifier: 0,
      status: 'ACTIVE',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      options: [
        { id: 8, name: 'Regular Milk', priceModifier: 0 },
        { id: 9, name: 'Oat Milk', priceModifier: 8000 },
        { id: 10, name: 'Almond Milk', priceModifier: 10000 },
        { id: 11, name: 'Soy Milk', priceModifier: 6000 }
      ]
    },
    {
      id: 4,
      name: 'Temperature',
      type: 'TEMPERATURE',
      description: 'Suhu minuman',
      priceModifier: 0,
      status: 'ACTIVE',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      options: [
        { id: 12, name: 'Hot', priceModifier: 0 },
        { id: 13, name: 'Iced', priceModifier: 0 }
      ]
    },
    {
      id: 5,
      name: 'Extra Shot',
      type: 'ADDON',
      description: 'Tambahan shot espresso',
      priceModifier: 0,
      status: 'INACTIVE',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      options: [
        { id: 14, name: 'Single Shot', priceModifier: 8000 },
        { id: 15, name: 'Double Shot', priceModifier: 15000 }
      ]
    }
  ];

  const variantTypes = [
    { value: 'SIZE', label: 'Size', color: 'bg-blue-100 text-blue-800' },
    { value: 'SUGAR', label: 'Sugar Level', color: 'bg-green-100 text-green-800' },
    { value: 'MILK', label: 'Milk Type', color: 'bg-purple-100 text-purple-800' },
    { value: 'TEMPERATURE', label: 'Temperature', color: 'bg-orange-100 text-orange-800' },
    { value: 'ADDON', label: 'Add-on', color: 'bg-pink-100 text-pink-800' }
  ];

  const statuses = [
    { value: 'ACTIVE', label: 'Aktif', color: 'bg-green-100 text-green-800' },
    { value: 'INACTIVE', label: 'Tidak Aktif', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setVariants(mockVariants);
      setFilteredVariants(mockVariants);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...variants];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(variant =>
        variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variant.options.some(option => 
          option.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(variant => variant.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(variant => variant.status === statusFilter);
    }

    // Sort variants
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'options':
          return b.options.length - a.options.length;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredVariants(filtered);
  }, [variants, searchTerm, typeFilter, statusFilter, sortBy]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setNewOption(prev => ({
      ...prev,
      [name]: name === 'priceModifier' ? parseInt(value) || 0 : value
    }));
  };

  const addOption = () => {
    if (!newOption.name.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { 
        id: Date.now(), 
        name: newOption.name, 
        priceModifier: newOption.priceModifier 
      }]
    }));
    setNewOption({ name: '', priceModifier: 0 });
  };

  const removeOption = (optionId) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(option => option.id !== optionId)
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama variant wajib diisi';
    }

    if (!formData.type) {
      errors.type = 'Tipe variant wajib dipilih';
    }

    if (formData.options.length === 0) {
      errors.options = 'Minimal harus ada satu opsi';
    }

    return errors;
  };

  const handleAddVariant = async (e) => {
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
      
      const newVariant = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setVariants(prev => [newVariant, ...prev]);
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        type: 'SIZE',
        description: '',
        priceModifier: 0,
        status: 'ACTIVE',
        options: []
      });
      setFormErrors({});
      
    } catch (error) {
      setFormErrors({ general: 'Gagal menambahkan variant' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVariant = async (e) => {
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
      
      setVariants(prev => prev.map(variant =>
        variant.id === selectedVariant.id
          ? { ...variant, ...formData, updatedAt: new Date().toISOString() }
          : variant
      ));

      setIsEditDialogOpen(false);
      setSelectedVariant(null);
      setFormData({
        name: '',
        type: 'SIZE',
        description: '',
        priceModifier: 0,
        status: 'ACTIVE',
        options: []
      });
      setFormErrors({});
      
    } catch (error) {
      setFormErrors({ general: 'Gagal mengupdate variant' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!variantToDelete) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVariants(prev => prev.filter(variant => variant.id !== variantToDelete.id));
      setIsDeleteDialogOpen(false);
      setVariantToDelete(null);
      
    } catch (error) {
      alert('Gagal menghapus variant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (variant) => {
    setSelectedVariant(variant);
    setFormData({
      name: variant.name,
      type: variant.type,
      description: variant.description,
      priceModifier: variant.priceModifier,
      status: variant.status,
      options: [...variant.options]
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (variant) => {
    setVariantToDelete(variant);
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

  const getTypeBadge = (type) => {
    const typeConfig = variantTypes.find(t => t.value === type);
    return (
      <Badge className={`${typeConfig.color} border-0`}>
        <Tag className="h-3 w-3 mr-1" />
        {typeConfig.label}
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

  const VariantFormDialog = ({ isEdit = false, isOpen, onOpenChange, onSubmit }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Variant' : 'Tambah Variant Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update informasi variant' : 'Masukkan informasi variant baru'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-6">
          {formErrors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formErrors.general}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Variant *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Size, Sugar Level"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipe Variant *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className={formErrors.type ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variantTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.type && (
                <p className="text-sm text-red-500">{formErrors.type}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Deskripsi variant..."
              rows={3}
            />
          </div>

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

          <Separator />

          {/* Options Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Opsi Variant *</Label>
              {formErrors.options && (
                <p className="text-sm text-red-500">{formErrors.options}</p>
              )}
            </div>

            {/* Add New Option */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <Label className="text-sm font-medium mb-3 block">Tambah Opsi Baru</Label>
              <div className="flex gap-2">
                <Input
                  name="name"
                  value={newOption.name}
                  onChange={handleOptionChange}
                  placeholder="Nama opsi (e.g., Small, Medium)"
                  className="flex-1"
                />
                <Input
                  name="priceModifier"
                  type="number"
                  value={newOption.priceModifier}
                  onChange={handleOptionChange}
                  placeholder="Tambahan harga"
                  className="w-32"
                />
                <Button type="button" onClick={addOption} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Options List */}
            {formData.options.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Daftar Opsi</Label>
                <div className="space-y-2">
                  {formData.options.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.priceModifier === 0 ? 'Gratis' : `+${formatPrice(option.priceModifier)}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(option.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Tambah'} Variant
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
            <Settings className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat data variant...</p>
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
            <h1 className="text-3xl font-bold">Manajemen Variant</h1>
            <p className="text-muted-foreground">
              Kelola variant dan opsi untuk menu kopi
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Variant
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{variants.length}</p>
                  <p className="text-sm text-muted-foreground">Total Variant</p>
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
                    {variants.filter(v => v.status === 'ACTIVE').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Variant Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Tag className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {variantTypes.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Tipe Variant</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {variants.reduce((total, variant) => total + variant.options.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Opsi</p>
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
                  placeholder="Cari nama variant atau opsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  {variantTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="name">Nama A-Z</SelectItem>
                  <SelectItem value="type">Tipe</SelectItem>
                  <SelectItem value="options">Opsi Terbanyak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Menampilkan {filteredVariants.length} dari {variants.length} variant
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

        {/* Variants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Variant</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVariants.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak ada variant ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
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
                      <TableHead>Variant</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Opsi</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Diupdate</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVariants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            {variant.description && (
                              <p className="text-sm text-muted-foreground">{variant.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(variant.type)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(variant.status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{variant.options.length} opsi</p>
                            <div className="flex flex-wrap gap-1">
                              {variant.options.slice(0, 3).map((option) => (
                                <Badge key={option.id} variant="outline" className="text-xs">
                                  {option.name}
                                </Badge>
                              ))}
                              {variant.options.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{variant.options.length - 3} lainnya
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(variant.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(variant.updatedAt)}
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
                              <DropdownMenuItem onClick={() => openEditDialog(variant)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(variant)}
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

        {/* Add Variant Dialog */}
        <VariantFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddVariant}
        />

        {/* Edit Variant Dialog */}
        <VariantFormDialog
          isEdit={true}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditVariant}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Variant</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus variant "{variantToDelete?.name}"? 
                Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi menu yang menggunakan variant ini.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="destructive" 
                onClick={handleDeleteVariant}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus Variant
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

export default VariantManagement;

