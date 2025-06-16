import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    User, 
    Mail, 
    Phone, 
    Edit, 
    Save, 
    X, 
    Heart, 
    ShoppingBag, 
    Star, 
    Coffee,
    TrendingUp,
    Calendar,
    Award,
    Eye,
    EyeOff,
    CheckCircle,
    Loader2,
    Lock,
    AlertTriangle
} from 'lucide-react';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateProfile, isAuthenticated, changePassword, toggleFavorite } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone_number: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });


    const [isLoading, setIsLoading] = useState(true); 
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');


    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Ketika user object dari AuthContext berubah (baik saat load awal atau setelah update)
        if (user) {
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || ''
            });
            setIsLoading(false); // Selesai loading karena data user sudah lengkap
        } else {
             
             setIsLoading(true); 
        }
    }, [user, isAuthenticated, navigate]);

    const handleEditToggle = () => {
        if (isEditing) {
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || ''
            });
        }
        setIsEditing(!isEditing);
        setError('');
        setSuccess('');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');

        const dataToSend = {
            name: editForm.name,
            phone_number: editForm.phone_number
        };

        if (dataToSend.name === '') dataToSend.name = null;
        if (dataToSend.phone_number === '') dataToSend.phone_number = null;


        try {
            const result = await updateProfile(user.id, dataToSend);

            if (result.success) {
                setSuccess('Profil berhasil diperbarui!');
                setIsEditing(false);
                setEditForm({ 
                    name: user.name || '',
                    email: user.email || '',
                    phone_number: user.phone_number || ''
                });
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Terjadi kesalahan saat memperbarui profil');
        } finally {
            setIsSaving(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        const levels = [
            { label: 'Sangat Lemah', color: 'text-red-500' },
            { label: 'Lemah', color: 'text-orange-500' },
            { label: 'Sedang', color: 'text-yellow-500' },
            { label: 'Kuat', color: 'text-blue-500' },
            { label: 'Sangat Kuat', color: 'text-green-500' }
        ];

        return { strength, ...levels[Math.min(strength, 4)] };
    };

    const passwordStrength = getPasswordStrength(passwordForm.newPassword);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        setError('');
        setSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Password baru tidak cocok');
            return;
        }

        if (passwordForm.newPassword.length < 8) { 
            setError('Password baru minimal 8 karakter');
            return;
        }

        setIsSaving(true);

        try {
            const result = await changePassword(
                passwordForm.currentPassword,
                passwordForm.newPassword,
                passwordForm.confirmPassword
            );
            
            if (result.success) {
                setSuccess('Password berhasil diperbarui!');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswords({ current: false, new: false, confirm: false });
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.error || 'Gagal mengubah password.');
            }

        } catch (err) {
            setError('Terjadi kesalahan saat memperbarui password. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    // Fungsi untuk menambah/menghapus favorit
    const handleToggleFavorite = async (coffeeId, isCurrentlyFavorite) => {
        setError('');
        setSuccess('');
        try {
            const result = await toggleFavorite(coffeeId, isCurrentlyFavorite); // Panggil dari AuthContext
            if (result.success) {
                setSuccess(isCurrentlyFavorite ? 'Favorit dihapus!' : 'Favorit ditambahkan!');
                setTimeout(() => setSuccess(''), 2000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Gagal mengubah status favorit.');
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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) { 
            return dateString;
        }
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Global loading state dari AuthContext
    if (isLoading || !user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <User className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                        <p className="text-muted-foreground">Memuat profil...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    // Destructuring data dari user object yang lengkap
    const { 
        name, email, phone_number, role, 
        orders_created_count, orders_paid_for_others_count, orders_paid_by_others_count, total_spent_amount,
        member_since, favorites: userFavorites, 
        bookings_count, orders_count 
    } = user;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Profil Saya</h1>
                    <p className="text-muted-foreground">
                        Kelola informasi profil dan preferensi Anda
                    </p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile">Profil</TabsTrigger>
                        <TabsTrigger value="statistics">Statistik</TabsTrigger>
                        <TabsTrigger value="favorites">Favorit</TabsTrigger>
                        <TabsTrigger value="security">Keamanan</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Informasi Profil</CardTitle>
                                        <CardDescription>
                                            Kelola informasi dasar akun Anda
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant={isEditing ? "outline" : "default"}
                                        onClick={handleEditToggle}
                                        disabled={isSaving}
                                    >
                                        {isEditing ? (
                                            <>
                                                <X className="mr-2 h-4 w-4" />
                                                Batal
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-6">
                                    {/* Avatar */}
                                    <div className="flex flex-col items-center space-y-4">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={user?.avatar} />
                                            <AvatarFallback className="text-lg">
                                                {name?.charAt(0)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <Button variant="outline" size="sm">
                                                Ubah Foto
                                            </Button>
                                        )}
                                    </div>

                                    {/* Profile Form */}
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Nama Lengkap</Label>
                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            value={editForm.name}
                                                            onChange={handleFormChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            value={editForm.email}
                                                            onChange={handleFormChange}
                                                            required
                                                            readOnly
                                                            className="bg-muted/50"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label htmlFor="phone_number">Nomor Telepon</Label>
                                                        <Input
                                                            id="phone_number"
                                                            name="phone_number"
                                                            value={editForm.phone_number}
                                                            onChange={handleFormChange}
                                                            placeholder="08xxxxxxxxxx"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button type="submit" disabled={isSaving}>
                                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Simpan
                                                    </Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-muted-foreground">Nama Lengkap</Label>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span>{name || '-'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-muted-foreground">Email</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            <span>{email || '-'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label className="text-sm text-muted-foreground">Nomor Telepon</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                                            <span>{phone_number || 'Belum diisi'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <Separator />
                                                
                                                <div className="space-y-2">
                                                    <Label className="text-sm text-muted-foreground">Role</Label>
                                                    <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
                                                        {role === 'ADMIN' ? 'Administrator' : 'Pengguna'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Statistics Tab */}
                    <TabsContent value="statistics" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <ShoppingBag className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{orders_created_count}</p>
                                            <p className="text-sm text-muted-foreground">Pesanan Dibuat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <TrendingUp className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{formatPrice(total_spent_amount)}</p>
                                            <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{orders_paid_for_others_count}</p>
                                            <p className="text-sm text-muted-foreground">Pesanan Dibayar Orang Lain</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Award className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{orders_paid_by_others_count}</p>
                                            <p className="text-sm text-muted-foreground">Pesanan Diterima dari Orang Lain</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ringkasan Aktivitas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Member Sejak</Label>
                                        <p className="font-medium">{formatDate(member_since)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Total Pesanan</Label>
                                        <p className="font-medium">{orders_count}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Total Booking</Label>
                                        <p className="font-medium">{bookings_count}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Item Favorit</Label>
                                        <p className="font-medium">{userFavorites.length} item</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Favorites Tab */}
                    <TabsContent value="favorites" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Kopi Favorit</CardTitle>
                                <CardDescription>
                                    Daftar kopi yang telah Anda tandai sebagai favorit
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userFavorites.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-4">Belum ada kopi favorit</p>
                                        <Button onClick={() => navigate('/menu')}>
                                            Jelajahi Menu
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {userFavorites.map((coffee) => {
                                            const isFavorite = userFavorites.some(fav => fav.id === coffee.id); // Cek status favorit dari userFavorites
                                            return (
                                                <Card key={coffee.id} className="group hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <div className="space-y-3">
                                                            {/* Gambar kopi dari image_url */}
                                                            {coffee.image_url ? (
                                                                <div className="aspect-square w-full rounded-lg overflow-hidden">
                                                                    <img 
                                                                        src={coffee.image_url} 
                                                                        alt={coffee.name} 
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                                                                    <Coffee className="h-12 w-12 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            
                                                            <div className="space-y-2">
                                                                <h3 className="font-medium">{coffee.name}</h3>
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                    <span className="text-sm">{coffee.rating_average ? coffee.rating_average.toFixed(1) : 'N/A'} ({coffee.rating_count} reviews)</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-bold text-primary">
                                                                    {formatPrice(coffee.price)}
                                                                </span>
                                                                <div className="flex gap-1">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => navigate(`/coffee/${coffee.id}`)}
                                                                    >
                                                                        Lihat
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleToggleFavorite(coffee.id, isFavorite)}
                                                                    >
                                                                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ubah Password</CardTitle>
                                <CardDescription>
                                    Pastikan akun Anda tetap aman dengan password yang kuat.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    {/* Password Saat Ini */}
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Password Saat Ini</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Masukkan password saat ini"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('current')}
                                            >
                                                {showPasswords.current ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Password Baru */}
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Password Baru</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Masukkan password baru"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('new')}
                                            >
                                                {showPasswords.new ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {/* Indikator Kekuatan Password */}
                                        {passwordForm.newPassword && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span>Kekuatan Password:</span>
                                                    <span className={passwordStrength.color}>
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${
                                                            passwordStrength.strength <= 1 ? 'bg-red-500' :
                                                            passwordStrength.strength <= 2 ? 'bg-orange-500' :
                                                            passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                                                            passwordStrength.strength <= 4 ? 'bg-blue-500' :
                                                            'bg-green-500'
                                                        }`}
                                                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Konfirmasi Password Baru */}
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Konfirmasi password baru"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                            >
                                                {showPasswords.confirm ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword ? (
                                            <p className="text-sm text-green-600 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Password cocok
                                            </p>
                                        ) : passwordForm.confirmPassword && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <X className="h-3 w-3" />
                                                Password tidak cocok
                                            </p>
                                        )}
                                    </div>

                                    {/* Persyaratan Password */}
                                    <div className="bg-muted/50 rounded-lg p-3">
                                        <p className="text-sm font-medium mb-2">Persyaratan Password Baru:</p>
                                        <ul className="text-xs text-muted-foreground space-y-1">
                                            <li className={passwordForm.newPassword.length >= 8 ? 'text-green-600' : ''}>
                                                • Minimal 8 karakter
                                            </li>
                                            <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                                                • Mengandung huruf besar
                                            </li>
                                            <li className={/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                                                • Mengandung angka
                                            </li>
                                            <li className={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                                                • Mengandung karakter khusus
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Tombol Submit */}
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Lock className="mr-2 h-4 w-4" />
                                        Ubah Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ProfilePage;