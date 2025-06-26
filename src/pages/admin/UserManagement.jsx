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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const UserManagement = () => {
  const { user: currentUser, api } = useAuth();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);


  // Memoize constants to prevent re-renders
  const roles = useMemo(() => [
    { value: 'USER', label: 'User', color: 'bg-blue-100 text-blue-800' },
    { value: 'ADMIN', label: 'Admin', color: 'bg-purple-100 text-purple-800' }
  ], []);

  const statuses = useMemo(() => [
    { value: 'ACTIVE', label: 'Aktif', color: 'bg-green-100 text-green-800' },
    { value: 'INACTIVE', label: 'Tidak Aktif', color: 'bg-red-100 text-red-800' }
  ], []);

  // Memoize filtered users to prevent unnecessary re-calculations
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm && searchTerm.trim() !== "") {
      filtered = filtered.filter(user =>
        (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone_number || "").includes(searchTerm)
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'orders':
          return (b.total_orders_count || 0) - (a.total_orders_count || 0);
        case 'spent':
          return (b.total_spent_amount || 0) - (a.total_spent_amount || 0);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/user-management/users');
      setUsers(response.data);
      console.log('Users fetched:', response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  // handleAddUser and handleEditUser will now receive the form data from the dialog
  const handleAddUser = useCallback(async (formDataFromDialog, setDialogErrors) => {
    setIsSubmitting(true);
    try {
      const userPayload = {
        name: formDataFromDialog.name,
        email: formDataFromDialog.email,
        phone_number: formDataFromDialog.phone_number,
        role: formDataFromDialog.role,
        password: formDataFromDialog.password
      };
      const response = await api.post('/admin/user-management/users', userPayload);
      console.log('User added:', response.data);
      fetchUsers();
      setIsAddDialogOpen(false);
      setDialogErrors({}); // Clear any local errors in dialog
    } catch (error) {
      console.error("Failed to add user:", error.response?.data || error.message);
      setDialogErrors({ general: error.response?.data?.detail || 'Gagal menambahkan user' });
    } finally {
      setIsSubmitting(false);
    }
  }, [api, fetchUsers]);

  const handleEditUser = useCallback(async (formDataFromDialog, setDialogErrors) => {
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      const userPayload = {
        name: formDataFromDialog.name,
        email: formDataFromDialog.email,
        phone_number: formDataFromDialog.phone_number,
        role: formDataFromDialog.role,
        is_active: formDataFromDialog.status === 'ACTIVE' ? true : false // Ensure boolean for is_active
      };

      if (formDataFromDialog.password) {
        userPayload.password = formDataFromDialog.password;
      }

      const response = await api.put(`/admin/user-management/users/${selectedUser.id}`, userPayload);
      console.log('User updated:', response.data);
      fetchUsers();

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setDialogErrors({}); // Clear any local errors in dialog
    } catch (error) {
      console.error("Failed to update user:", error.response?.data || error.message);
      setDialogErrors({ general: error.response?.data?.detail || 'Gagal mengupdate user' });
    } finally {
      setIsSubmitting(false);
    }
  }, [api, fetchUsers, selectedUser]);

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    setIsSubmitting(true);

    try {
      await api.delete(`/admin/user-management/users/${userToDelete.id}`);
      console.log('User deleted:', userToDelete.id);
      fetchUsers();

      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error.response?.data || error.message);
      alert('Gagal menghapus user: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSubmitting(false);
    }
  }, [userToDelete, api, fetchUsers]);

  const openEditDialog = useCallback((user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((user) => {
    setUserToDelete(user);
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

  const getRoleBadge = useCallback((role) => {
    const roleConfig = roles.find(r => r.value === role);
    return (
      <Badge className={`${roleConfig.color} border-0`}>
        {role === 'ADMIN' ? <Shield className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
        {roleConfig.label}
      </Badge>
    );
  }, [roles]);

  const getStatusBadge = useCallback((status) => {
    const statusConfig = statuses.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig.color} border-0`}>
        {status === 'ACTIVE' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
        {statusConfig.label}
      </Badge>
    );
  }, [statuses]);

  // UserFormDialog will now manage its own state
  const UserFormDialog = React.memo(({ isEdit = false, isOpen, onOpenChange, onSubmit, initialUser = null, allUsers = [] }) => {
    const [formData, setFormData] = useState(() => ({
      name: initialUser?.name || '',
      email: initialUser?.email || '',
      phone_number: initialUser?.phone_number || '',
      role: initialUser?.role || 'USER',
      status: initialUser?.is_active ? 'ACTIVE' : 'INACTIVE',
      password: ''
    }));
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Function to calculate password strength
    const getPasswordStrength = useCallback((password) => {
      if (!password) return { strength: 0, label: '', color: '' };

      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

      const levels = [
        { label: 'Sangat Lemah', color: 'text-red-500' },
        { label: 'Lemah', color: 'text-orange-500' },
        { label: 'Sedang', color: 'text-yellow-500' },
        { label: 'Kuat', color: 'text-blue-500' },
        { label: 'Sangat Kuat', color: 'text-green-500' }
      ];

      return { strength, ...levels[Math.min(strength, 4)] };
    }, []);

    const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password, getPasswordStrength]);


    // Reset form data when dialog opens for a new user or changes initial user
    useEffect(() => {
      if (isOpen) {
        setFormData({
          name: initialUser?.name || '',
          email: initialUser?.email || '',
          phone_number: initialUser?.phone_number || '',
          role: initialUser?.role || 'USER',
          status: initialUser?.is_active ? 'ACTIVE' : 'INACTIVE',
          password: ''
        });
        setFormErrors({}); // Clear errors when dialog opens
      }
    }, [isOpen, initialUser]);

    const debounceTimeoutRef = useRef(null);

    const handleInputChange = useCallback((e) => {
      const { name, value } = e.target;

      // Immediately update the form data
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Clear previous debounce timeout for validation/error clearing
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set a new debounce timeout for clearing errors
      debounceTimeoutRef.current = setTimeout(() => {
        if (formErrors[name]) {
          setFormErrors(prev => ({
            ...prev,
            [name]: ''
          }));
        }
      }, 300); // Adjust the delay as needed for validation/error clearing
    }, [formErrors]); // formErrors is a dependency because we check formErrors[name]

    // Memoize validation function - it now receives `allUsers` for email uniqueness check
    const validateForm = useCallback((isEditMode = false) => {
      const errors = {};

      if (!formData.name.trim()) {
        errors.name = 'Nama wajib diisi';
      }

      if (!formData.email.trim()) {
        errors.email = 'Email wajib diisi';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = 'Format email tidak valid';
      } else {
        // Check if email already exists (except for current user in edit mode)
        const existingUser = allUsers.find(user =>
          user.email === formData.email && (!isEditMode || user.id !== initialUser?.id)
        );
        if (existingUser) {
          errors.email = 'Email sudah digunakan';
        }
      }

      if (!formData.phone_number?.trim()) {
        errors.phone_number = 'Nomor telepon wajib diisi';
      } else if (!/^(\+62|0)\d{8,12}$/.test(formData.phone_number)) {
        errors.phone_number = 'Format nomor telepon tidak valid. Contoh: 081234567890 atau +6281234567890.';
      }

      // Password validation with strength check
      if (!isEditMode && !formData.password.trim()) {
        errors.password = 'Password wajib diisi';
      } else if (formData.password.trim() && formData.password.length < 8) { // Only check length if not empty
        errors.password = 'Password minimal 8 karakter';
      } else if (formData.password.trim() && passwordStrength.strength < 3 && !isEditMode) { // Require at least 'Sedang' strength for new users
        errors.password = 'Password terlalu lemah. Minimal harus memiliki 3 dari 5 kriteria (panjang >= 8, huruf kapital, angka, simbol).';
      }


      return errors;
    }, [formData, allUsers, initialUser, passwordStrength.strength]);


    const handleSubmit = useCallback(async (e) => {
      e.preventDefault();

      const errors = validateForm(isEdit);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Pass formData and setFormErrors to the parent's onSubmit function
      await onSubmit(formData, setFormErrors);

    }, [formData, validateForm, isEdit, onSubmit]);


    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit User' : 'Tambah User Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update informasi user' : 'Masukkan informasi user baru'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formErrors.general}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Nomor Telepon *</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="08xxxxxxxxxx"
                className={formErrors.phone_number ? 'border-red-500' : ''}
              />
              {formErrors.phone_number && (
                <p className="text-sm text-red-500">{formErrors.phone_number}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isEdit && (
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
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {isEdit ? '(Kosongkan jika tidak ingin mengubah)' : '*'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={formErrors.password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {/* Password strength indicator */}
              {formData.password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300
                        ${passwordStrength.strength === 0 && 'w-0'}
                        ${passwordStrength.strength === 1 && 'w-1/4 bg-red-500'}
                        ${passwordStrength.strength === 2 && 'w-2/4 bg-orange-500'}
                        ${passwordStrength.strength === 3 && 'w-3/4 bg-yellow-500'}
                        ${passwordStrength.strength === 4 && 'w-full bg-blue-500'}
                        ${passwordStrength.strength === 5 && 'w-full bg-green-500'}
                      `}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              {formErrors.password && (
                <p className="text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Tambah'} User
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
            <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Memuat data user...</p>
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
            <h1 className="text-3xl font-bold">Manajemen User</h1>
            <p className="text-muted-foreground">
              Kelola user dan hak akses sistem
            </p>
          </div>
          <Button onClick={() => {
            setSelectedUser(null); // Ensure no user is selected for add
            setIsAddDialogOpen(true);
          }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total User</p>
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
                    {users.filter(u => u.status === 'ACTIVE').length}
                  </p>
                  <p className="text-sm text-muted-foreground">User Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'ADMIN').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'USER').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Regular User</p>
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
                  placeholder="Cari nama, email, atau nomor telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
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
                  <SelectItem value="email">Email A-Z</SelectItem>
                  <SelectItem value="orders">Pesanan Terbanyak</SelectItem>
                  <SelectItem value="spent">Pengeluaran Tertinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Menampilkan {filteredUsers.length} dari {users.length} user
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

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar User</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tidak ada user ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
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
                      <TableHead>User</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Statistik</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead>Login Terakhir</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 4)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {user.phone_number ? user.phone_number : 'Belum diisi'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <p>{user.totalOrders} pesanan</p>
                            <p className="text-muted-foreground">
                              {formatPrice(user.total_spent_amount)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.member_since)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(user.last_login)}
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
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {user.id !== currentUser?.id && (
                                <DropdownMenuItem
                                  onClick={() => openDeleteDialog(user)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              )}
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

        {/* Add User Dialog */}
        <UserFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddUser}
          initialUser={null} // No initial user for adding
          allUsers={users} // Pass all users for email uniqueness validation
        />

        {/* Edit User Dialog */}
        <UserFormDialog
          isEdit={true}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditUser}
          initialUser={selectedUser} // Pass the selected user to initialize the form
          allUsers={users} // Pass all users for email uniqueness validation
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus User</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus user "{userToDelete?.name}"?
                Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus User
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

export default UserManagement;