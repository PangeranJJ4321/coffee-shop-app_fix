import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; 
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
  const { api } = useAuth(); 

  const [variantTypes, setVariantTypes] = useState([]); 
  const [allVariants, setAllVariants] = useState([]); 

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); 
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Untuk dialog Add/Edit Tipe Varian
  const [selectedVariantType, setSelectedVariantType] = useState(null); 
  const [isVariantTypeAddDialogOpen, setIsVariantTypeAddDialogOpen] = useState(false);
  const [isVariantTypeEditDialogOpen, setIsVariantTypeEditDialogOpen] = useState(false);
  const [isVariantTypeDeleteDialogOpen, setIsVariantTypeDeleteDialogOpen] = useState(false);
  const [variantTypeToDelete, setVariantTypeToDelete] = useState(null);

  // Untuk dialog Add/Edit Varian (opsi individual)
  const [selectedVariantOption, setSelectedVariantOption] = useState(null); 
  const [isVariantOptionAddDialogOpen, setIsVariantOptionAddDialogOpen] = useState(false);
  const [isVariantOptionEditDialogOpen, setIsVariantOptionEditDialogOpen] = useState(false);
  const [isVariantOptionDeleteDialogOpen, setIsVariantOptionDeleteDialogOpen] = useState(false);
  const [variantOptionToDelete, setVariantOptionToDelete] = useState(null);


  const [isSubmitting, setIsSubmitting] = useState(false);


  const statuses = useMemo(() => [
    { value: 'ACTIVE', label: 'Aktif', color: 'bg-green-100 text-green-800' },
    { value: 'INACTIVE', label: 'Tidak Aktif', color: 'bg-red-100 text-red-800' }
  ], []);

  const variantTypeColor = [
    { value: 'Size', label: 'Size', color: 'bg-blue-100 text-blue-800' },
    { value: 'Sugar Level', label: 'Sugar Level', color: 'bg-green-100 text-green-800' },
    { value: 'Milk Type', label: 'Milk Type', color: 'bg-purple-100 text-purple-800' },
    { value: 'Temperature', label: 'Temperature', color: 'bg-orange-100 text-orange-800' },
    { value: 'Add-on', label: 'Add-on', color: 'bg-pink-100 text-pink-800' }
  ];

  const variantTypesBadge= (name) => {
    const typeConfig = variantTypeColor.find(t => t.value === name);
    if (!typeConfig) return null;
    return (
      <Badge className={`${typeConfig.color} border-0`}>
        <Tag className="h-3 w-3 mr-1" />
        {typeConfig.label}
      </Badge>
    );
  }



  const memoizedVariantTypes = useMemo(() => {
    return variantTypes.map(type => ({
      value: type.id,
      label: type.name
    }));
  }, [variantTypes]);



  // Filtered Variant Types (yang akan ditampilkan di tabel utama)
  const filteredVariantTypes = useMemo(() => {
    let filtered = [...variantTypes];

    if (searchTerm && searchTerm.trim() !== "") {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(type =>
        (type.name || "").toLowerCase().includes(lowercasedSearch) ||
        (type.description || "").toLowerCase().includes(lowercasedSearch) ||
        // Juga cari di nama varian yang terkait dengan tipe ini
        allVariants.some(variant =>
          variant.variant_type_id === type.id && (variant.name || "").toLowerCase().includes(lowercasedSearch)
        )
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(type => type.id === typeFilter);
    }



    if (statusFilter !== 'all') {
      filtered = filtered.filter(type => {
        const typeVariants = allVariants.filter(variant => variant.variant_type_id === type.id);
        if (statusFilter === 'ACTIVE') {
          return typeVariants.some(variant => variant.status === 'ACTIVE');
        } else {
          return typeVariants.some(variant => variant.status === 'INACTIVE');
        }
      });
    }


    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return (a.name || "").localeCompare(b.name || "");
        // 'options' tidak lagi menjadi sortable di level tipe varian
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [variantTypes, searchTerm, typeFilter, statusFilter, allVariants, sortBy]);


  // Fetch data (variants and variant types) from API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const typesResponse = await api.get('/admin/menu-management/variant-types');
      setVariantTypes(typesResponse.data); 

      const variantsResponse = await api.get('/admin/menu-management/variants');
      setAllVariants(variantsResponse.data.map(v => ({ 
          ...v,
          status: v.is_available ? 'ACTIVE' : 'INACTIVE' 
      })));
      console.log("Fetched Variant Types:", typesResponse.data);
      console.log("Fetched Variants:", variantsResponse.data);
    } catch (error) {
      console.error("Failed to fetch variant data:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


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

  const getTypeBadge = useCallback((typeId) => {
    const typeConfig = variantTypes.find(t => t.id === typeId);
    if (!typeConfig) return null;
    const colors = {
      'SIZE': 'bg-blue-100 text-blue-800',
      'SUGAR': 'bg-green-100 text-green-800',
      'MILK': 'bg-purple-100 text-purple-800',
      'TEMPERATURE': 'bg-orange-100 text-orange-800',
      'ADDON': 'bg-pink-100 text-pink-800',
    };
    return (
      <Badge className={`${colors[typeConfig.name] || 'bg-gray-100 text-gray-800'} border-0`}>
        <Tag className="h-3 w-3 mr-1" />
        {typeConfig.name}
      </Badge>
    );
  }, [variantTypes]);

  const getStatusBadge = useCallback((status) => {
    const statusConfig = statuses.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color || 'bg-gray-100 text-gray-800'} border-0`}>
        {status === 'ACTIVE' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
        {statusConfig?.label || status}
      </Badge>
    );
  }, [statuses]);


  const handleAddVariantType = useCallback(async (formDataFromDialog, setDialogErrors) => {
      setIsSubmitting(true);
      try {
          const payload = {
              name: formDataFromDialog.name,
              description: formDataFromDialog.description,
              is_required: formDataFromDialog.is_required,
          };
          const response = await api.post('/admin/menu-management/variant-types', payload);
          console.log('Variant type added:', response.data);
          fetchData(); 
          setIsVariantTypeAddDialogOpen(false);
          setDialogErrors({});
      } catch (error) {
          console.error("Failed to add variant type:", error.response?.data || error.message);
          setDialogErrors({ general: error.response?.data?.detail || 'Gagal menambahkan tipe variant' });
      } finally {
          setIsSubmitting(false);
      }
  }, [api, fetchData]);

  const handleEditVariantType = useCallback(async (formDataFromDialog, setDialogErrors) => {
      if (!selectedVariantType) return;
      setIsSubmitting(true);
      try {
          const payload = {
              name: formDataFromDialog.name,
              description: formDataFromDialog.description,
              is_required: formDataFromDialog.is_required,
          };
          const response = await api.put(`/admin/menu-management/variant-types/${selectedVariantType.id}`, payload);
          console.log('Variant type updated:', response.data);
          fetchData(); 
          setIsVariantTypeEditDialogOpen(false);
          setSelectedVariantType(null);
          setDialogErrors({});
      } catch (error) {
          console.error("Failed to edit variant type:", error.response?.data || error.message);
          setDialogErrors({ general: error.response?.data?.detail || 'Gagal mengupdate tipe variant' });
      } finally {
          setIsSubmitting(false);
      }
  }, [api, fetchData, selectedVariantType]);

  const handleDeleteVariantType = useCallback(async () => {
      if (!variantTypeToDelete) return;
      setIsSubmitting(true);
      try {
          await api.delete(`/admin/menu-management/variant-types/${variantTypeToDelete.id}`);
          console.log('Variant type deleted:', variantTypeToDelete.id);
          fetchData(); 
          setIsVariantTypeDeleteDialogOpen(false);
          setVariantTypeToDelete(null);
      } catch (error) {
          console.error("Failed to delete variant type:", error.response?.data || error.message);
          alert('Gagal menghapus tipe variant: ' + (error.response?.data?.detail || error.message));
      } finally {
          setIsSubmitting(false);
      }
  }, [api, fetchData, variantTypeToDelete]);


  const openVariantTypeEditDialog = useCallback((type) => {
    setSelectedVariantType(type);
    setIsVariantTypeEditDialogOpen(true);
  }, []);

  const openVariantTypeDeleteDialog = useCallback((type) => {
    setVariantTypeToDelete(type);
    setIsVariantTypeDeleteDialogOpen(true);
  }, []);


  const handleAddVariantOption = useCallback(async (formDataFromDialog, setDialogErrors) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formDataFromDialog.name,
        additional_price: formDataFromDialog.additional_price,
        is_available: formDataFromDialog.status === 'ACTIVE',
        variant_type_id: formDataFromDialog.variant_type_id, 
      };
      const response = await api.post('/admin/menu-management/variants', payload);
      console.log('Variant option added:', response.data);
      fetchData(); // Refresh all data
      setIsVariantOptionAddDialogOpen(false);
      setDialogErrors({});
    } catch (error) {
      console.error("Failed to add variant option:", error.response?.data || error.message);
      setDialogErrors({ general: error.response?.data?.detail || 'Gagal menambahkan opsi variant' });
    } finally {
      setIsSubmitting(false);
    }
  }, [api, fetchData]);

  const handleEditVariantOption = useCallback(async (formDataFromDialog, setDialogErrors) => {
    if (!selectedVariantOption) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: formDataFromDialog.name,
        additional_price: formDataFromDialog.additional_price,
        is_available: formDataFromDialog.status === 'ACTIVE',
        variant_type_id: formDataFromDialog.variant_type_id,
      };
      const response = await api.put(`/admin/menu-management/variants/${selectedVariantOption.id}`, payload);
      console.log('Variant option updated:', response.data);
      fetchData(); // Refresh all data
      setIsVariantOptionEditDialogOpen(false);
      setSelectedVariantOption(null);
      setDialogErrors({});
    } catch (error) {
      console.error("Failed to edit variant option:", error.response?.data || error.message);
      setDialogErrors({ general: error.response?.data?.detail || 'Gagal mengupdate opsi variant' });
    } finally {
      setIsSubmitting(false);
    }
  }, [api, fetchData, selectedVariantOption]);

  const handleDeleteVariantOption = useCallback(async () => {
    if (!variantOptionToDelete) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/menu-management/variants/${variantOptionToDelete.id}`);
      console.log('Variant option deleted:', variantOptionToDelete.id);
      fetchData(); // Refresh all data
      setIsVariantOptionDeleteDialogOpen(false);
      setVariantOptionToDelete(null);
    } catch (error) {
      console.error("Failed to delete variant option:", error.response?.data || error.message);
      alert('Gagal menghapus opsi variant: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSubmitting(false);
    }
  }, [api, fetchData, variantOptionToDelete]);

  const openVariantOptionAddDialog = useCallback((variantTypeId) => {
    // Set default variant type for new option
    setSelectedVariantType(variantTypes.find(type => type.id === variantTypeId)); // Set selectedVariantType to pass to dialog
    setSelectedVariantOption(null); // No initial option for adding
    setIsVariantOptionAddDialogOpen(true);
  }, [variantTypes]);

  const openVariantOptionEditDialog = useCallback((option) => {
    setSelectedVariantOption(option); // Set the full option object for editing
    setSelectedVariantType(variantTypes.find(type => type.id === option.variant_type_id)); // Set its parent type
    setIsVariantOptionEditDialogOpen(true);
  }, [variantTypes]);

  const openVariantOptionDeleteDialog = useCallback((option) => {
    setVariantOptionToDelete(option);
    setIsVariantOptionDeleteDialogOpen(true);
  }, []);


  // --- KOMPONEN DIALOG FORM UNTUK TIPE VARIAN ---
  const VariantTypeFormDialog = React.memo(({ isEdit = false, isOpen, onOpenChange, onSubmit, initialVariantType = null }) => {
    const [formData, setFormData] = useState(() => ({
      name: initialVariantType?.name || '',
      description: initialVariantType?.description || '',
      is_required: initialVariantType?.is_required || false,
    }));
    const [formErrors, setFormErrors] = useState({});
    const didOpenRef = useRef(false);

    useEffect(() => {
      if (isOpen) {
        if (!didOpenRef.current || (initialVariantType && initialVariantType.id !== formData.id)) {
          setFormData({
            name: initialVariantType?.name || '',
            description: initialVariantType?.description || '',
            is_required: initialVariantType?.is_required || false,
          });
          setFormErrors({});
          didOpenRef.current = true;
        }
      } else {
        didOpenRef.current = false;
      }
    }, [isOpen, initialVariantType, formData.id]);

    const handleInputChange = useCallback((e) => {
      const { name, value, type, checked } = e.target; // Added checked
      setFormData(prev => {
        let newValue = type === 'checkbox' ? checked : value; // Handle checkbox
        setFormErrors(currentErrors => {
          const newErrors = { ...currentErrors };
          delete newErrors[name];
          return newErrors;
        });
        return { ...prev, [name]: newValue };
      });
    }, []);

    const validateForm = useCallback(() => {
      const errors = {};
      if (!formData.name.trim()) { errors.name = 'Nama tipe variant wajib diisi'; }
      return errors;
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
      e.preventDefault();
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      await onSubmit(formData, setFormErrors);
    }, [formData, validateForm, onSubmit]);

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Tipe Variant' : 'Tambah Tipe Variant Baru'}</DialogTitle>
            <DialogDescription>{isEdit ? 'Update informasi tipe variant' : 'Masukkan informasi tipe variant baru'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.general && (
              <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{formErrors.general}</AlertDescription></Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Tipe Variant *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className={formErrors.name ? 'border-red-500' : ''} />
              {formErrors.name && (<p className="text-sm text-red-500">{formErrors.name}</p>)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Deskripsi tipe variant..." rows={3} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is_required" name="is_required" checked={formData.is_required} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))} />
              <Label htmlFor="is_required" className="text-sm">Wajib dipilih saat memilih menu</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Tambah'} Tipe Variant
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  });

  const VariantOptionFormDialog = React.memo(({ isEdit = false, isOpen, onOpenChange, onSubmit, initialVariantOption = null, availableVariantTypes, statuses, formatPrice }) => {
    const [formData, setFormData] = useState(() => ({
      name: initialVariantOption?.name || '',
      additional_price: initialVariantOption?.additional_price || 0,
      description: initialVariantOption?.description || '',
      status: initialVariantOption?.is_available ? 'ACTIVE' : 'INACTIVE',
      variant_type_id: initialVariantOption?.variant_type_id || (availableVariantTypes.length > 0 ? availableVariantTypes[0].id : ''), 
    }));
    const [formErrors, setFormErrors] = useState({});
    const didOpenRef = useRef(false);

    useEffect(() => {
      if (isOpen) {
        if (!didOpenRef.current || (initialVariantOption && initialVariantOption.id !== formData.id)) {
          setFormData({
            name: initialVariantOption?.name || '',
            additional_price: initialVariantOption?.additional_price || 0,
            description: initialVariantOption?.description || '',
            status: initialVariantOption?.is_available ? 'ACTIVE' : 'INACTIVE',
            variant_type_id: initialVariantOption?.variant_type_id || (availableVariantTypes.length > 0 ? availableVariantTypes[0].id : ''),
          });
          setFormErrors({});
          didOpenRef.current = true;
        }
      } else {
        didOpenRef.current = false;
      }
    }, [isOpen, initialVariantOption, availableVariantTypes, formData.id]);


    const handleInputChange = useCallback((e) => {
      const { name, value, type } = e.target;
      setFormData(prev => {
        let newValue = type === 'number' ? parseInt(value) || 0 : value;
        setFormErrors(currentErrors => {
          const newErrors = { ...currentErrors };
          delete newErrors[name];
          return newErrors;
        });
        return { ...prev, [name]: newValue };
      });
    }, []);

    const validateForm = useCallback(() => {
      const errors = {};
      if (!formData.name.trim()) { errors.name = 'Nama opsi variant wajib diisi'; }
      if (!formData.variant_type_id) { errors.variant_type_id = 'Tipe variant wajib dipilih'; } // Corrected field name
      if (formData.additional_price < 0) { errors.additional_price = 'Harga tambahan tidak bisa negatif'; }
      return errors;
    }, [formData]);


    const handleSubmit = useCallback(async (e) => {
      e.preventDefault();
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      await onSubmit(formData, setFormErrors);
    }, [formData, validateForm, onSubmit]);


    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Opsi Variant' : 'Tambah Opsi Variant Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update informasi opsi variant' : 'Masukkan informasi opsi variant baru'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.general && (
              <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{formErrors.general}</AlertDescription></Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Opsi Variant *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Small, No Sugar"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (<p className="text-sm text-red-500">{formErrors.name}</p>)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant_type_id">Tipe Variant *</Label> {/* Corrected label */}
              <Select
                value={formData.variant_type_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, variant_type_id: value }))} 
              >
                <SelectTrigger className={formErrors.variant_type_id ? 'border-red-500' : ''}> 
                  <SelectValue placeholder="Pilih Tipe Variant" />
                </SelectTrigger>
                <SelectContent>
                  {availableVariantTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.variant_type_id && (
                <p className="text-sm text-red-500">{formErrors.variant_type_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_price">Harga Tambahan</Label>
              <Input
                id="additional_price"
                name="additional_price"
                type="number"
                value={formData.additional_price}
                onChange={handleInputChange}
                placeholder="0"
                className={formErrors.additional_price ? 'border-red-500' : ''}
              />
              {formErrors.additional_price && (
                <p className="text-sm text-red-500">{formErrors.additional_price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Deskripsi singkat opsi variant..."
                rows={2}
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

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Tambah'} Opsi Variant
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
  });


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
            <h1 className="text-3xl font-bold">Manajemen Variant & Opsi</h1>
            <p className="text-muted-foreground">
              Kelola tipe variant dan opsi individual untuk menu kopi
            </p>
          </div>
          <Button onClick={() => setIsVariantTypeAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tipe Variant
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
                  <p className="text-2xl font-bold">{allVariants.length}</p>
                  <p className="text-sm text-muted-foreground">Total Opsi</p>
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
                    {allVariants.filter(v => v.status === 'ACTIVE').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Opsi Aktif</p>
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
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {allVariants.filter(v => v.additional_price > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Opsi Berbayar</p>
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
                  {memoizedVariantTypes.map((type) => (
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
                  <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                  <SelectItem value="price_low">Harga Terendah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Menampilkan {filteredVariantTypes.length} dari {variantTypes.length} tipe variant
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

        {/* Variant Types Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tipe Variant</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVariantTypes.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak ada tipe variant ditemukan</h3>
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
                      <TableHead>Tipe Variant</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Opsi</TableHead>
                      <TableHead>Wajib</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Diupdate</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVariantTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{type.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {type.id.slice(0, 8)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {type.description || '-'}
                        </TableCell>
                        <TableCell>
                          {variantTypesBadge(type.name)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {allVariants
                              .filter(variant => variant.variant_type_id === type.id)
                              .map(option => (
                                <div key={option.id} className="flex items-center gap-2">
                                  <Badge variant="outline" className={`${option.status === 'ACTIVE' ? 'border-green-400 text-green-500' : 'border-red-400 text-red-700'} text-xs`}>
                                    {option.name}
                                    {option.additional_price > 0 && (
                                      <span className="ml-1">+{formatPrice(option.additional_price)}</span>
                                    )}
                                  </Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Aksi Opsi</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => openVariantOptionEditDialog(option)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Opsi
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => openVariantOptionDeleteDialog(option)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" /> Hapus Opsi
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))}
                            <Button
                              variant="secondary"
                              size="sm"
                              className="mt-2"
                              onClick={() => openVariantOptionAddDialog(type.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Tambah Opsi
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {type.is_required ? (
                            <Badge variant="secondary" className="bg-orange-300 text-white">
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Opsional</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(type.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(type.updated_at)}
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
                              <DropdownMenuLabel>Aksi Tipe Variant</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openVariantTypeEditDialog(type)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Tipe
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openVariantTypeDeleteDialog(type)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Tipe
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

        {/* Add/Edit Variant Type Dialog */}
        <VariantTypeFormDialog
          isOpen={isVariantTypeAddDialogOpen || isVariantTypeEditDialogOpen}
          isEdit={isVariantTypeEditDialogOpen}
          onOpenChange={(open) => {
            setIsVariantTypeAddDialogOpen(open);
            setIsVariantTypeEditDialogOpen(open);
            if (!open) setSelectedVariantType(null);
          }}
          onSubmit={isVariantTypeEditDialogOpen ? handleEditVariantType : handleAddVariantType}
          initialVariantType={selectedVariantType}
          statuses={statuses}
          formatPrice={formatPrice}
        />

        {/* Add/Edit Variant Option Dialog */}
        <VariantOptionFormDialog
          isOpen={isVariantOptionAddDialogOpen || isVariantOptionEditDialogOpen}
          isEdit={isVariantOptionEditDialogOpen}
          onOpenChange={(open) => {
            setIsVariantOptionAddDialogOpen(open);
            setIsVariantOptionEditDialogOpen(open);
            if (!open) {
                setSelectedVariantOption(null);
                setSelectedVariantType(null);
            }
          }}
          onSubmit={isVariantOptionEditDialogOpen ? handleEditVariantOption : handleAddVariantOption}
          initialVariantOption={selectedVariantOption}
          availableVariantTypes={variantTypes}
          statuses={statuses}
          formatPrice={formatPrice}
        />

        {/* Delete Confirmation Dialog for Variant Type */}
        <Dialog open={isVariantTypeDeleteDialogOpen} onOpenChange={setIsVariantTypeDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Tipe Variant</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus tipe variant "{variantTypeToDelete?.name}"?
                Semua opsi variant di bawah tipe ini juga akan terhapus.
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteVariantType}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus Tipe Variant
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsVariantTypeDeleteDialogOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog for Variant Option */}
        <Dialog open={isVariantOptionDeleteDialogOpen} onOpenChange={setIsVariantOptionDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Opsi Variant</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus opsi variant "{variantOptionToDelete?.name}"?
                Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi menu yang menggunakan opsi ini.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteVariantOption}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus Opsi Variant
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsVariantOptionDeleteDialogOpen(false)}
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