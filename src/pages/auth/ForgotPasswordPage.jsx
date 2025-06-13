import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coffee, Loader2, CheckCircle, ArrowLeft, Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate email
    if (!email) {
      setError('Email wajib diisi');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Format email tidak valid');
      setIsLoading(false);
      return;
    }

    try {
      // Mock API call for password reset
      // In a real application, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock success response
      setSuccess(true);
      setEmailSent(true);
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim email reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mock resend email API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError('Gagal mengirim ulang email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Email Terkirim!</CardTitle>
            <CardDescription>
              Kami telah mengirim link reset password ke email Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Silakan cek email Anda di:
              </p>
              <p className="font-medium text-primary">{email}</p>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Link reset password akan kedaluwarsa dalam 24 jam. 
                Jika tidak menerima email, cek folder spam Anda.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleResendEmail}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Ulang Email
              </Button>

              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Button>
              </Link>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Email berhasil dikirim ulang!</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Coffee className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Lupa Password?</CardTitle>
          <CardDescription>
            Masukkan email Anda dan kami akan mengirim link untuk reset password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={error ? 'border-red-500' : ''}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Masukkan email yang terdaftar di akun Anda
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Mengirim...' : 'Kirim Link Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Kembali ke Login
            </Link>
            
            <div className="text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Daftar sekarang
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Butuh bantuan?</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Pastikan email yang dimasukkan benar</p>
              <p>• Cek folder spam jika tidak menerima email</p>
              <p>• Hubungi customer service jika masih bermasalah</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;

