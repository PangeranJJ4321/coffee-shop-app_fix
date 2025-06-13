import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  ArrowLeft, 
  Coffee, 
  Search,
  AlertTriangle
} from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            {/* Large 404 Text */}
            <h1 className="text-9xl md:text-[12rem] font-bold text-muted-foreground/20 select-none">
              404
            </h1>
            
            {/* Coffee Cup Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 rounded-full p-8">
                <Coffee className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
              <h2 className="text-3xl font-bold text-foreground">
                Halaman Tidak Ditemukan
              </h2>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              Maaf, halaman yang Anda cari tidak dapat ditemukan. 
              Mungkin halaman telah dipindahkan, dihapus, atau URL yang Anda masukkan salah.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong>Kemungkinan penyebab:</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• URL yang diketik salah atau tidak lengkap</li>
                <li>• Halaman telah dipindahkan ke lokasi lain</li>
                <li>• Link yang Anda klik sudah tidak valid</li>
                <li>• Halaman sedang dalam maintenance</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              
              <Link to="/">
                <Button className="flex items-center gap-2 w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  Ke Beranda
                </Button>
              </Link>
              
              <Link to="/menu">
                <Button 
                  variant="outline"
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Coffee className="h-4 w-4" />
                  Lihat Menu
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link to="/" className="group">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Home className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-sm">Beranda</h3>
                <p className="text-xs text-muted-foreground">Kembali ke halaman utama</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/menu" className="group">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Coffee className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-sm">Menu Kopi</h3>
                <p className="text-xs text-muted-foreground">Jelajahi menu kopi kami</p>
              </CardContent>
            </Card>
          </Link>

          <div className="group cursor-pointer" onClick={() => window.location.reload()}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Search className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-sm">Coba Lagi</h3>
                <p className="text-xs text-muted-foreground">Muat ulang halaman</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Jika masalah berlanjut, silakan hubungi tim support kami.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © 2024 Coffee Shop. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

