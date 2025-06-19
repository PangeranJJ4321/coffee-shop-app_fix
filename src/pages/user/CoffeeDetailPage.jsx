import React, { useState, useEffect, useCallback } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Import Select components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    Loader2,
    Clock,
    Users
} from 'lucide-react';

const CoffeeDetailPage = () => {
    const { id } = useParams(); // ID kopi dari URL
    const navigate = useNavigate();
    const { addToCart } = useCart(); // Ambil `addToCart`
    const { api, user, isAuthenticated, toggleFavorite } = useAuth();

    const [coffee, setCoffee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedVariants, setSelectedVariants] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);

    // State untuk Rating/Review
    const [ratingForm, setRatingForm] = useState({ rating: 0, review: '' });
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [ratingSuccess, setRatingSuccess] = useState('');
    const [ratingError, setRatingError] = useState('');
    const [reviews, setReviews] = useState([]);

    // ✅ Fungsi terpisah untuk fetch reviews saja
    const fetchReviews = useCallback(async () => {
        try {
            const reviewsResponse = await api.get(`/ratings/coffee/${id}`);
            setReviews(reviewsResponse.data);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        }
    }, [id, api]);

    // ✅ Fetch coffee details tanpa quantity dependency
    const fetchCoffeeDetails = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // 1. Ambil detail kopi
            const coffeeResponse = await api.get(`/menu/coffee/${id}`);
            const fetchedCoffee = coffeeResponse.data;
            setCoffee(fetchedCoffee);

            // 2. Ambil ulasan/reviews
            const reviewsResponse = await api.get(`/ratings/coffee/${id}`);
            setReviews(reviewsResponse.data);

            const initialVariants = {};
            let initialPrice = fetchedCoffee.price;
            if (fetchedCoffee.variants) {
                Object.values(fetchedCoffee.variants).forEach(variantList => {
                    const defaultVariant = variantList.find(v => v.is_default);

                    if (defaultVariant) {
                        initialVariants[defaultVariant.variant_type_id] = defaultVariant.id;
                        initialPrice += defaultVariant.additional_price;
                    }

                    // For optional variants, if no default is set,
                    // we want the select to show its placeholder, meaning no selection.
                    // This means `selectedVariants[variantTypeId]` should be `undefined` initially
                    // if there's no default and it's not required.
                    else if (variantList[0]?.is_required && variantList.length > 0) {
                        initialVariants[variantList[0].variant_type_id] = variantList[0].id;
                        initialPrice += variantList[0].additional_price;
                    }
                    // If not required and no default, leave it undefined in initialVariants
                    // so the Select component shows its placeholder.
                });
            }
            setSelectedVariants(initialVariants);
            // ✅ Set initial price tanpa quantity
            setTotalPrice(initialPrice);

        } catch (err) {
            console.error("Failed to fetch coffee details:", err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Gagal memuat detail kopi. Item mungkin tidak ditemukan atau tidak tersedia.');
        } finally {
            setTimeout(() => { // Memberikan sedikit delay untuk efek loading
                setIsLoading(false);
            }, 500);
        }
    }, [id, api]); // ✅ Hapus quantity dari dependency

    useEffect(() => {
        if (id) {
            fetchCoffeeDetails();
        }
    }, [id, fetchCoffeeDetails]);

    // ✅ Update total price whenever quantity or selectedVariants change
    useEffect(() => {
        if (coffee) {
            let currentPrice = coffee.price;
            Object.values(selectedVariants).forEach(selectedVariantId => {
                // Only add price if selectedVariantId is not undefined/null/empty string
                if (selectedVariantId) {
                    Object.values(coffee.variants || {}).forEach(variantList => {
                        const foundVariant = variantList.find(v => v.id === selectedVariantId);
                        if (foundVariant) {
                            currentPrice += foundVariant.additional_price;
                        }
                    });
                }
            });
            setTotalPrice(currentPrice * quantity);
        }
    }, [quantity, selectedVariants, coffee]);

    // ✅ Callback untuk quantity change
    const handleQuantityChange = useCallback((amount) => {
        setQuantity(prev => Math.max(1, prev + amount));
    }, []);

    // ✅ Callback untuk variant change
    const handleVariantChange = useCallback((variantTypeId, value) => {
        // If the value passed is a special "no-selection" indicator, store undefined
        // Otherwise, store the actual variant ID
        setSelectedVariants(prev => ({
            ...prev,
            [variantTypeId]: value === "no-selection" ? undefined : value
        }));
    }, []);


    const handleAddToCart = () => {
        if (!coffee.is_available) {
            setError("Maaf, item ini tidak tersedia untuk saat ini.");
            return;
        }
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Kumpulkan detail varian yang dipilih untuk CartContext
        const variantsToSendToCart = [];
        let missingRequired = false;

        Object.values(coffee.variants || {}).forEach(variantList => {
            const variantTypeId = variantList[0]?.variant_type_id;
            const isRequired = variantList[0]?.is_required;
            const selectedVariantId = selectedVariants[variantTypeId];

            if (isRequired && !selectedVariantId) { // `selectedVariantId` will be `undefined` if "Tidak Ada" was selected for a required field
                missingRequired = true;
                return;
            }

            if (selectedVariantId) { // This check naturally skips `undefined` and empty strings
                const detail = variantList.find(v => v.id === selectedVariantId);
                if (detail) {
                    variantsToSendToCart.push({
                        variant_id: detail.id, // Hanya butuh variant_id untuk backend
                        name: detail.name,
                        additional_price: detail.additional_price,
                        variant_type: detail.variant_type_name, // Untuk display di CartContext
                    });
                }
            }
        });

        if (missingRequired) {
            setError("Harap pilih semua opsi yang diperlukan (misal: ukuran, level gula).");
            return;
        }

        addToCart(coffee, variantsToSendToCart, quantity); // Panggil addToCart dari CartContext
        setSuccess('Item berhasil ditambahkan ke keranjang!');
        setTimeout(() => setSuccess(''), 2000);
        setError(''); // Hapus error sebelumnya
    };

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        // `isFavorite` harus dicek dari `user.favorites` yang terbaru dari AuthContext
        const isCurrentlyFavorite = user?.favorites?.some(fav => fav.id === coffee.id) || false;
        const result = await toggleFavorite(coffee.id, isCurrentlyFavorite); // Panggil toggleFavorite dari AuthContext
        if (result.success) {
            setSuccess(isCurrentlyFavorite ? 'Favorit dihapus!' : 'Favorit ditambahkan!');
            setTimeout(() => setSuccess(''), 2000);
        } else {
            setError(result.error);
        }
    };

    // ✅ Rating/Review Functions dengan optimistic updates
    const handleRatingChange = useCallback((newRating) => {
        setRatingForm(prev => ({ ...prev, rating: newRating }));
    }, []);

    const handleReviewChange = useCallback((e) => {
        setRatingForm(prev => ({ ...prev, review: e.target.value })); // Menggunakan `review` bukan `comment`
    }, []);

    // ✅ Update coffee rating secara manual tanpa fetch ulang
    const updateCoffeeRating = useCallback((newReview) => {
        setCoffee(prev => {
            if (!prev) return prev;
            
            const newRatingCount = prev.rating_count + 1;
            const newRatingAverage = ((prev.rating_average * prev.rating_count) + newReview.rating) / newRatingCount;
            
            return {
                ...prev,
                rating_count: newRatingCount,
                rating_average: newRatingAverage
            };
        });
    }, []);

    // ✅ Tambah review baru ke state tanpa fetch ulang
    const addNewReviewToState = useCallback((newReview, newRating) => {
        const reviewToAdd = {
            id: Date.now(), // temporary ID
            rating: newRating,
            review: newReview,
            user_name: user?.name || 'Anda',
            created_at: new Date().toISOString()
        };
        
        setReviews(prev => [reviewToAdd, ...prev]);
    }, [user?.name]);

    // ✅ Handle submit rating yang dioptimasi
    const handleSubmitRating = async (e) => {
        e.preventDefault();
        if (ratingForm.rating === 0) {
            setRatingError("Harap berikan rating (bintang).");
            return;
        }
        if (!isAuthenticated) {
            setRatingError("Anda harus login untuk memberikan rating.");
            return;
            }

        setIsSubmittingRating(true);
        setRatingSuccess('');
        setRatingError('');

        try {
            const response = await api.post(`/ratings/coffee/${id}`, {
                rating: ratingForm.rating,
                review: ratingForm.review
            });
            
            if (response.status === 201) {
                setRatingSuccess('Rating dan ulasan berhasil dikirim!');
                
                // ✅ Update state secara manual tanpa fetch ulang (optimistic update)
                addNewReviewToState(ratingForm.review, ratingForm.rating);
                updateCoffeeRating({ rating: ratingForm.rating });
                
                // Reset form
                setRatingForm({ rating: 0, review: '' });
                
                // ✅ Auto-hide success message
                setTimeout(() => setRatingSuccess(''), 3000);
                
            } else {
                setRatingError('Gagal mengirim rating. Silakan coba lagi.');
            }
        } catch (err) {
            console.error("Failed to submit rating:", err.response?.data || err.message);
            setRatingError(err.response?.data?.detail || 'Terjadi kesalahan saat mengirim rating.');
        } finally {
            setIsSubmittingRating(false);
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
        // `created_at` di RatingResponse adalah datetime, jadi langsung gunakan Date object
        const date = new Date(dateString);
        if (isNaN(date.getTime())) { // Cek tanggal tidak valid
            return dateString;
        }
        return date.toLocaleDateString('id-ID', {
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
                        className={`h-4 w-4 ${star <= rating
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

    // Jika ada error fatal dari API (misal, 404 Not Found)
    if (error && !coffee) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => navigate('/menu')} className="mt-4">Kembali ke Menu</Button>
            </div>
        );
    }

    // Jika tidak ada kopi ditemukan setelah loading selesai (misal, ID tidak valid)
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

    // `isFavorite` dicek dari `user.favorites` di AuthContext
    const isFavorite = user?.favorites?.some(fav => fav.id === coffee.id) || false;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Success/Error Messages */}
            {success && (
                <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

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
                        {coffee.image_url ? (
                            <img
                                src={coffee.image_url}
                                alt={coffee.name}
                                className="w-full h-96 object-cover rounded-lg shadow-md"
                            />
                        ) : (
                            <Coffee className="h-32 w-32 text-muted-foreground" />
                        )}
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

                {/* Coffee Details and Actions */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold">{coffee.name}</h1>
                                <div className="flex items-center gap-2">
                                    {renderStars(coffee.rating_average)}
                                    <span className="text-lg font-medium">
                                        {coffee.rating_average ? coffee.rating_average.toFixed(1) : 'N/A'}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        ({coffee.rating_count} reviews)
                                    </span>
                                </div>
                                <Badge variant="outline">{coffee.category}</Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleFavoriteToggle}
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

                    {coffee.variants && Object.keys(coffee.variants).length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Pilih Varian</h3>
                            <Separator />
                            {Object.entries(coffee.variants).map(([variantTypeName, variantsList]) => {
                                const variantTypeId = variantsList[0]?.variant_type_id;
                                const isRequired = variantsList.some(v => v.is_required);

                                return (
                                    <div key={variantTypeName} className="space-y-2">
                                        <Label className="text-sm">
                                            {variantTypeName} {isRequired ? '*' : ''}
                                        </Label>
                                        <Select
                                            // `value` untuk Select harus string. Jika `selectedVariants[variantTypeId]` adalah undefined,
                                            // kirim string kosong agar placeholder muncul.
                                            value={selectedVariants[variantTypeId] === undefined ? "" : selectedVariants[variantTypeId]}
                                            onValueChange={(value) => handleVariantChange(variantTypeId, value)}
                                        >
                                            <SelectTrigger className="w-48"> {/* Sesuaikan lebar sesuai keinginan */}
                                                <SelectValue placeholder={`Pilih ${variantTypeName}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Tambahkan opsi "Tidak Ada" hanya jika varian tidak wajib */}
                                                {!isRequired && (
                                                    // Gunakan nilai yang jelas berbeda dari ID varian, misalnya "no-selection"
                                                    // atau biarkan `value` tidak ada (tapi itu akan memicu Radix warning di beberapa versi).
                                                    // Menggunakan `value="no-selection"` adalah pendekatan yang aman.
                                                    <SelectItem value="no-selection">Tidak Ada / Batal</SelectItem>
                                                )}

                                                {variantsList.map(variant => (
                                                    <SelectItem
                                                        key={variant.id}
                                                        value={variant.id} // value ini adalah ID varian
                                                        disabled={!variant.is_available}
                                                    >
                                                        {variant.name} {variant.additional_price > 0 && `(+${formatPrice(variant.additional_price)})`}
                                                        {!variant.is_available && " (Tidak Tersedia)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Jumlah</Label>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                                type="button"
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
                                onClick={() => handleQuantityChange(1)}
                                type="button"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Harga</p>
                                <p className="text-2xl font-bold text-primary">
                                    {formatPrice(totalPrice)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="lg"
                                    onClick={handleAddToCart}
                                    disabled={!coffee.is_available}
                                    className="flex-1"
                                    type="button"
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
                        Ulasan ({reviews.length}) {/* reviews sekarang dari API */}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Produk</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                {coffee.long_description || coffee.description} {/* Gunakan `long_description` jika ada, fallback ke `description` */}
                            </p>

                            {/* Informasi Produk Tambahan dari Backend */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-2">Informasi Produk</h4>
                                    <div className="space-y-2 text-sm">
                                        {coffee.coffee_shop_name && ( // `coffee_shop_name` ada di CoffeeMenuDetailResponse
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Coffee Shop:</span>
                                                <span>{coffee.coffee_shop_name}</span>
                                            </div>
                                        )}
                                        {coffee.origin && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Asal:</span>
                                                <span>{coffee.origin}</span>
                                            </div>
                                        )}
                                        {coffee.roast_level && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tingkat Roasting:</span>
                                                <span>{coffee.roast_level}</span>
                                            </div>
                                        )}
                                        {coffee.caffeine_content && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Kandungan Kafein:</span>
                                                <span>{coffee.caffeine_content}</span>
                                            </div>
                                        )}
                                        {coffee.preparation_time && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Waktu Persiapan:</span>
                                                <span>{coffee.preparation_time}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                    {/* Add Review Form */}
                    {isAuthenticated ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tulis Ulasan</CardTitle>
                                <CardDescription>
                                    Bagikan pengalaman Anda dengan kopi ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmitRating} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Rating</Label>
                                        {renderStars(
                                            ratingForm.rating,
                                            true,
                                            handleRatingChange
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="review">Komentar</Label>
                                        <Textarea
                                            id="review"
                                            placeholder="Tulis ulasan Anda..."
                                            value={ratingForm.review} // Menggunakan `review` bukan `comment`
                                            onChange={handleReviewChange}
                                            rows={4}
                                        />
                                    </div>

                                    <Button type="submit" disabled={isSubmittingRating}>
                                        {isSubmittingRating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {/* Menggunakan Loader2 */}
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Kirim Ulasan
                                            </>
                                        )}
                                    </Button>
                                    {ratingSuccess && (
                                        <Alert className="border-green-200 bg-green-50 text-green-800">
                                            <CheckCircle className="h-4 w-4" />
                                            <AlertDescription>{ratingSuccess}</AlertDescription>
                                        </Alert>
                                    )}
                                    {ratingError && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{ratingError}</AlertDescription>
                                        </Alert>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Alert>
                            <AlertDescription>
                                <Button variant="link" className="p-0 h-auto align-baseline" onClick={() => navigate('/login')}>Login</Button> untuk memberikan rating dan ulasan.
                            </AlertDescription>
                        </Alert>
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
                                            {/* Avatar bisa dari review.user_avatar jika ada di API */}
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
                                                <p className="text-muted-foreground">{review.review}</p> {/* `review.comment` menjadi `review.review` */}
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