# Coffee Shop - Aplikasi Pemesanan Kopi

Aplikasi frontend untuk coffee shop yang dibangun menggunakan React.js, Tailwind CSS, dan Shadcn/UI components. Aplikasi ini menyediakan antarmuka yang lengkap untuk pelanggan dan admin coffee shop.

## 🚀 Live Demo

**URL Deployment**: [https://hozwhqpo.manus.space](https://hozwhqpo.manus.space)

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

### **Installation Magic** 🪄

```bash
# 1️⃣ Clone the repository
git clone https://github.com/PangeranJJ4321/coffee-shop-app_fix
cd coffee-shop-app

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start development server
npm run dev --host

# 4️⃣ Open your browser
# 🌐 http://localhost:5173
```

### **Production Build** 🏗️

```bash
npm run build
# Files akan tersimpan di folder 'dist/' 📁
```

---

## 🔐 **Demo Accounts**

<div align="center">

| Role | Email | Password | Access Level |
|:----:|:-----:|:--------:|:------------:|
| 👤 **User** | john@example.com | `password` | Customer Features |
| 🎛️ **Admin** | admin@coffeeshop.com | `password` | Full Control Panel |

</div>

---

## 📱 **Responsive & Cross-Platform**

<div align="center">

```
📱 Mobile (320px+)    💻 Desktop (1024px+)    📲 Tablet (768px+)
     Perfect              Optimal               Seamless
```

</div>

---

## 🎨 **Design Philosophy**

### **Color Palette** 🎨
```css
Primary   → #8B4513 (Rich Coffee Brown)
Secondary → #D2691E (Warm Chocolate)  
Accent    → #CD853F (Sandy Brown)
Background→ #F5F5DC (Cream Beige)
Text      → #2F1B14 (Dark Espresso)
```

### **Typography** ✍️
- **Font Family**: Inter, System Fonts
- **Hierarchy**: Clear visual distinction
- **Readability**: Optimized for all screen sizes

---

## 🗂️ **Project Architecture**

```
coffee-shop-app/
├── 🎨 src/
│   ├── 🧩 components/
│   │   ├── layout/          # Navbar, Footer, Sidebar
│   │   └── ui/              # Reusable UI Components
│   ├── 🔄 contexts/         # Global State Management
│   ├── 📄 pages/
│   │   ├── user/            # Customer Interface
│   │   ├── admin/           # Admin Dashboard
│   │   └── auth/            # Authentication
│   ├── 🛠️ utils/            # Helper Functions
│   ├── 🚀 App.jsx           # Main Application
│   └── 📍 main.jsx          # Entry Point
├── 🌐 public/               # Static Assets
└── 📋 package.json          # Dependencies
```

---

## 🔮 **Roadmap & Future Features**

<details>
<summary><strong>🚀 Phase 1: Core Enhancement</strong></summary>

- [ ] **Real-time Notifications** 🔔
- [ ] **Dark/Light Theme Toggle** 🌙
- [ ] **Progressive Web App (PWA)** 📱
- [ ] **Offline Mode Support** 📶

</details>

<details>
<summary><strong>🎯 Phase 2: Advanced Features</strong></summary>

- [ ] **AI-Powered Recommendations** 🤖
- [ ] **Voice Ordering** 🎤
- [ ] **Loyalty Program** 💎
- [ ] **Social Media Integration** 📲

</details>

<details>
<summary><strong>🌍 Phase 3: Scale & Expansion</strong></summary>

- [ ] **Multi-language Support** 🌐
- [ ] **Multi-store Management** 🏪
- [ ] **Delivery Integration** 🚗
- [ ] **Advanced Analytics** 📊

</details>

---


### **How to Contribute** 🎯

1. **Fork** the repository 🍴
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`) 🌿
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`) 💾
4. **Push** to the branch (`git push origin feature/AmazingFeature`) 🚀
5. **Open** a Pull Request 📝

---

## 📞 **Connect With Us**

<div align="center">

**Ada pertanyaan? Butuh bantuan? Atau sekadar ingin ngobrol tentang kopi? ☕**

[![Email](https://img.shields.io/badge/📧_Email-coffee@example.com-red?style=for-the-badge)](mailto:coffee@example.com)
[![GitHub](https://img.shields.io/badge/🐙_GitHub-PangeranJJ4321-black?style=for-the-badge)](https://github.com/PangeranJJ4321)
[![Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-success?style=for-the-badge)](https://coffee-shop-app-fix.vercel.app)

</div>

---

## 📄 **License**

<div align="center">

**MIT License** - feel free to use this project for learning and development! 🎓

*Made with ❤️, ☕, and lots of passion for great coffee*

---

**⭐ If you love this project, don't forget to give it a star! ⭐**

*"Life's too short for bad coffee and ugly apps"* ☕✨

</div>