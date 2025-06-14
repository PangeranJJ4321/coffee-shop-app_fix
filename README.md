# Coffee Shop - Aplikasi Pemesanan Kopi

Aplikasi frontend untuk coffee shop yang dibangun menggunakan React.js, Tailwind CSS, dan Shadcn/UI components. Aplikasi ini menyediakan antarmuka yang lengkap untuk pelanggan dan admin coffee shop.

## 🚀 Live Demo

**URL Deployment**: [coffee-shop-app-fix.vercel.app](coffee-shop-app-fix.vercel.app)

## 📋 Fitur Utama

### Untuk Pengguna (User)
- **Halaman Beranda**: Informasi coffee shop, menu pilihan, jam operasional
- **Menu Kopi**: Daftar lengkap menu dengan rating dan harga
- **Detail Kopi**: Informasi detail, varian, dan sistem rating
- **Keranjang Belanja**: Manajemen item pesanan
- **Checkout & Pembayaran QRIS**: Proses pemesanan dengan pembayaran QRIS
- **Riwayat Pesanan**: Tracking pesanan dan status
- **Profil Pengguna**: Manajemen akun dan favorit

### Untuk Admin
- **Dashboard Admin**: Statistik dan overview bisnis
- **Manajemen Menu**: CRUD operasi untuk menu kopi
- **Manajemen Varian**: Pengaturan varian (ukuran, level gula, dll)
- **Manajemen Pesanan**: Tracking dan update status pesanan
- **Manajemen Pengguna**: Administrasi user dan role
- **Analytics**: Laporan penjualan dan analitik

### Fitur Autentikasi
- Login/Register dengan validasi
- Session management
- Role-based access (User/Admin)
- Protected routes

## 🛠️ Teknologi yang Digunakan

- **React.js** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Component library
- **React Router DOM** - Routing
- **Lucide React** - Icon library
- **Vite** - Build tool dan development server

## 🏗️ Struktur Proyek

```
coffee-shop-app/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Navbar, Footer)
│   │   └── ui/              # Shadcn/UI components
│   ├── contexts/            # React contexts (Auth, Cart)
│   ├── pages/
│   │   ├── user/            # User pages
│   │   ├── admin/           # Admin pages
│   │   └── auth/            # Authentication pages
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── package.json             # Dependencies
└── README.md               # Documentation
```

## 🚀 Instalasi dan Development

### Prerequisites
- Node.js (v18 atau lebih baru)
- pnpm (package manager)

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <https://github.com/PangeranJJ4321/coffee-shop-app_fix>
   cd coffee-shop-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Jalankan development server**
   ```bash
   npm run dev --host
   ```

4. **Buka browser**
   ```
   http://localhost:5173
   ```

### Build untuk Production

```bash
npm run build
```

File hasil build akan tersimpan di folder `dist/`.

## 🔐 Demo Credentials

Untuk testing aplikasi, gunakan kredensial berikut:

### User Account
- **Email**: john@example.com
- **Password**: password

### Admin Account
- **Email**: admin@coffeeshop.com
- **Password**: password

## 📱 Responsive Design

Aplikasi ini didesain untuk bekerja optimal di berbagai perangkat:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Design System

### Color Scheme
- Primary: Coffee brown tones
- Secondary: Warm amber/orange accents
- Background: Light neutral colors
- Text: Dark grays for readability

### Typography
- Font family: System fonts (Inter, sans-serif)
- Responsive font sizes
- Clear hierarchy

## 🔄 State Management

### Context Providers
- **AuthContext**: Manajemen autentikasi dan user session
- **CartContext**: Manajemen keranjang belanja

### Local Storage
- User session data
- Cart items persistence

## 🛣️ Routing Structure

```
/ - Homepage
/menu - Menu page
/coffee/:id - Coffee detail
/cart - Shopping cart
/checkout - Checkout process
/payment/:orderId - Payment page
/orders - Order history
/profile - User profile
/login - Login page
/register - Registration page
/admin - Admin dashboard
/admin/menu - Menu management
/admin/variants - Variant management
/admin/orders - Order management
/admin/users - User management
/admin/analytics - Analytics
```

## 🔮 Pengembangan Selanjutnya

Aplikasi ini telah menyediakan struktur dasar yang solid. Untuk pengembangan lebih lanjut, Anda dapat:

1. **Implementasi Backend Integration**
   - Koneksi ke REST API atau GraphQL
   - Real-time updates dengan WebSocket
   - Database integration

2. **Fitur Tambahan**
   - Push notifications
   - Geolocation untuk delivery
   - Payment gateway integration
   - Review dan rating system
   - Loyalty program

3. **Optimisasi**
   - Code splitting
   - Image optimization
   - Performance monitoring
   - SEO optimization

## 📄 Lisensi

Proyek ini dibuat untuk keperluan demonstrasi dan pembelajaran.

## 🤝 Kontribusi

Untuk kontribusi atau pertanyaan, silakan buat issue atau pull request di repository ini.

---

**Dibuat dengan ❤️ menggunakan React.js, Tailwind CSS, dan Shadcn/UI**

