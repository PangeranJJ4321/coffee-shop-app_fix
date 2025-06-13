import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Coffee, 
  ShoppingCart, 
  User, 
  Menu, 
  Home, 
  BookOpen,
  History,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const NavLinks = ({ mobile = false, onLinkClick = () => {} }) => (
    <>
      <Link
        to="/"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActivePath('/') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        } ${mobile ? 'w-full' : ''}`}
        onClick={onLinkClick}
      >
        <Home className="h-4 w-4" />
        Beranda
      </Link>
      <Link
        to="/menu"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActivePath('/menu') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        } ${mobile ? 'w-full' : ''}`}
        onClick={onLinkClick}
      >
        <BookOpen className="h-4 w-4" />
        Menu
      </Link>
      {isAuthenticated && (
        <>
          <Link
            to="/orders"
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isActivePath('/orders') 
                ? 'bg-primary text-primary-foreground' 
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            } ${mobile ? 'w-full' : ''}`}
            onClick={onLinkClick}
          >
            <History className="h-4 w-4" />
            Riwayat Pesanan
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                location.pathname.startsWith('/admin') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              } ${mobile ? 'w-full' : ''}`}
              onClick={onLinkClick}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="text-foreground">Coffee Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLinks />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-4 w-4" />
                {getTotalItems() > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <History className="mr-2 h-4 w-4" />
                    Riwayat Pesanan
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Masuk
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Daftar
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks mobile onLinkClick={() => setIsMobileMenuOpen(false)} />
                  
                  {!isAuthenticated && (
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => {
                          navigate('/login');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Masuk
                      </Button>
                      <Button 
                        className="justify-start"
                        onClick={() => {
                          navigate('/register');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Daftar
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

