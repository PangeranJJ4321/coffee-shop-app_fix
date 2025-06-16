import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  Clock,
  Shield
} from 'lucide-react';

const EmailVerificationPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error, expired
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');

  // Get token from URL params
  const token = searchParams.get('token');
  const email = searchParams.get('email') || user?.email || '';

  useEffect(() => {
    // Auto-verify if token is present
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  useEffect(() => {
    // Cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmail = async (verificationToken) => {
    try {
      setVerificationStatus('pending');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification logic
      if (verificationToken === 'valid-token' || verificationToken.length > 10) {
        setVerificationStatus('success');
        setMessage('Email Anda berhasil diverifikasi! Sekarang Anda dapat menggunakan semua fitur aplikasi.');
      } else if (verificationToken === 'expired-token') {
        setVerificationStatus('expired');
        setMessage('Link verifikasi telah kedaluwarsa. Silakan minta link verifikasi baru.');
      } else {
        setVerificationStatus('error');
        setMessage('Link verifikasi tidak valid atau telah digunakan sebelumnya.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Terjadi kesalahan saat memverifikasi email. Silakan coba lagi.');
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage('Email verifikasi baru telah dikirim ke ' + email);
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error) {
      setMessage('Gagal mengirim email verifikasi. Silakan coba lagi.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
      default:
        return <Mail className="h-16 w-16 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Berhasil Diverifikasi!';
      case 'error':
        return 'Verifikasi Gagal';
      case 'expired':
        return 'Link Verifikasi Kedaluwarsa';
      case 'pending':
      default:
        return 'Memverifikasi Email...';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
      case 'expired':
        return 'border-red-200 bg-red-50';
      case 'pending':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className={`${getStatusColor()} border-2`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold">
              {getStatusTitle()}
            </CardTitle>
            <CardDescription className="text-base">
              {!token && 'Verifikasi email Anda untuk mengaktifkan akun'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Message */}
            {message && (
              <Alert className={
                verificationStatus === 'success' 
                  ? 'border-green-200 bg-green-50' 
                  : verificationStatus === 'error' || verificationStatus === 'expired'
                  ? 'border-red-200 bg-red-50'
                  : 'border-blue-200 bg-blue-50'
              }>
                <AlertDescription className="text-sm">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Info */}
            {email && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email:</span>
                </div>
                <p className="font-medium mt-1">{email}</p>
              </div>
            )}

            {/* Verification Instructions */}
            {!token && verificationStatus === 'pending' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Langkah Verifikasi:
                      </h4>
                      <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. Buka email Anda</li>
                        <li>2. Cari email dari Coffee Shop</li>
                        <li>3. Klik link verifikasi dalam email</li>
                        <li>4. Kembali ke halaman ini untuk konfirmasi</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Link verifikasi berlaku selama 24 jam</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Resend Verification */}
              {(verificationStatus === 'expired' || (!token && verificationStatus === 'pending')) && (
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full"
                  variant={verificationStatus === 'expired' ? 'default' : 'outline'}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Kirim Ulang ({resendCooldown}s)
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Kirim Ulang Email Verifikasi
                    </>
                  )}
                </Button>
              )}

              {/* Success Actions */}
              {verificationStatus === 'success' && (
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <Button 
                      onClick={() => navigate('/')}
                      className="w-full"
                    >
                      Lanjutkan ke Beranda
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/login')}
                      className="w-full"
                    >
                      Masuk ke Akun
                    </Button>
                  )}
                </div>
              )}

              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Tidak menerima email?</p>
              <p className="mt-1">
                Periksa folder spam atau{' '}
                <button
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  kirim ulang
                </button>
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge 
                variant={
                  verificationStatus === 'success' 
                    ? 'default' 
                    : verificationStatus === 'error' || verificationStatus === 'expired'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {verificationStatus === 'success' && 'Terverifikasi'}
                {verificationStatus === 'error' && 'Gagal'}
                {verificationStatus === 'expired' && 'Kedaluwarsa'}
                {verificationStatus === 'pending' && 'Menunggu Verifikasi'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            Butuh bantuan?{' '}
            <Link to="/contact" className="text-primary hover:underline">
              Hubungi Support
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            © 2024 Coffee Shop. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;

