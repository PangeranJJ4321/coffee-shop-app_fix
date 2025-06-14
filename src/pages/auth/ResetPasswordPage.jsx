import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Shield,
  Key,
  AlertTriangle
} from 'lucide-react';

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetStatus, setResetStatus] = useState('form'); // form, success, error, invalid
  const [message, setMessage] = useState('');
  
  // Get token and email from URL params
  const token = searchParams.get('token');
  const email = searchParams.get('email') || '';

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setResetStatus('invalid');
      setMessage('Link reset password tidak valid atau tidak ditemukan.');
    } else {
      validateToken(token);
    }
  }, [token]);

  const validateToken = async (resetToken) => {
    try {
      // Simulate token validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation logic
      if (resetToken === 'expired-token') {
        setResetStatus('invalid');
        setMessage('Link reset password telah kedaluwarsa. Silakan minta link reset baru.');
      } else if (resetToken.length < 10) {
        setResetStatus('invalid');
        setMessage('Link reset password tidak valid.');
      }
      // If valid, keep status as 'form'
    } catch (error) {
      setResetStatus('invalid');
      setMessage('Terjadi kesalahan saat memvalidasi link reset password.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock reset password logic
      const success = await resetPassword(email, formData.password, token);
      
      if (success) {
        setResetStatus('success');
        setMessage('Password berhasil direset! Sekarang Anda dapat masuk dengan password baru.');
      } else {
        setResetStatus('error');
        setMessage('Gagal mereset password. Silakan coba lagi atau minta link reset baru.');
      }
    } catch (error) {
      setResetStatus('error');
      setMessage('Terjadi kesalahan saat mereset password. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { label: 'Sangat Lemah', color: 'text-red-500' },
      { label: 'Lemah', color: 'text-orange-500' },
      { label: 'Sedang', color: 'text-yellow-500' },
      { label: 'Kuat', color: 'text-blue-500' },
      { label: 'Sangat Kuat', color: 'text-green-500' }
    ];

    return { strength, ...levels[Math.min(strength, 4)] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Render different states
  if (resetStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900">
                Link Tidak Valid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Link to="/forgot-password">
                  <Button className="w-full">
                    Minta Link Reset Baru
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (resetStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-900">
                Password Berhasil Direset!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Masuk dengan Password Baru
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Key className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Masukkan password baru untuk akun Anda
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Email Info */}
            {email && (
              <div className="bg-muted/50 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Reset password untuk:</span>
                </div>
                <p className="font-medium mt-1">{email}</p>
              </div>
            )}

            {/* Error Message */}
            {resetStatus === 'error' && message && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500' : ''}
                    placeholder="Masukkan password baru"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                
                {/* Password Strength */}
                {formData.password && (
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
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                    placeholder="Konfirmasi password baru"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Persyaratan Password:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                    • Minimal 6 karakter
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                    • Mengandung huruf besar
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                    • Mengandung angka
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                    • Mengandung karakter khusus
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-spin" />
                    Mereset Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>

              {/* Back to Login */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Login
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Ingat password Anda?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

