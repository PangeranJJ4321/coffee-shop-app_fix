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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
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
  Shield,
  Users,
  Package,
  BarChart3,
  ClipboardList,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { ModeToggle } from '../utility/ModeToggle';

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

  const isActiveAdminPath = (path) => {
    return location.pathname.startsWith(path);
  };

  const AdminNavLinks = ({ mobile = false, onLinkClick = () => {} }) => (
    <>
      <Link
        to="/admin"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActivePath('/admin') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        } ${mobile ? 'w-full' : ''}`}
        onClick={onLinkClick}
      >
        <BarChart3 className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        to="/admin/orders"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActivePath('/admin/orders') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        } ${mobile ? 'w-full' : ''}`}
        onClick={onLinkClick}
      >
        <ClipboardList className="h-4 w-4" />
        Kelola Pesanan
      </Link>
      <Link
        to="/admin/menu"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActivePath('/admin/menu') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        } ${mobile ? 'w-full' : ''}`}
        onClick={onLinkClick}
      >
        <Coffee className="h-4 w-4" />
        Kelola Menu
      </Link>
      <Link
        to="/admin/variants"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActivePath('/admin/variants') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        } ${mobile ? 'w-full' : ''}`}
        onClick={onLinkClick}
      >
        <Sliders className="h-4 w-4" />
        Kelola Varian
      </Link>
      <Link
        to="/admin/users"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActivePath('/admin/users') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        } ${mobile ? 'w-full' : ''}`}
        onClick={onLinkClick}
      >
        <Users className="h-4 w-4" />
        Kelola User
      </Link>
      <Link
        to="/admin/analytics"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActivePath('/admin/analytics') 
            ? 'bg-primary text-primary-foreground' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        } ${mobile ? 'w-full' : ''}`}
        onClick={onLinkClick}
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </Link>
    </>
  );

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
        </>
      )}
    </>
  );

  // Check if we're in admin area
  const isInAdminArea = location.pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="text-foreground">Coffee Shop</span>
            {isInAdminArea && (
              <Badge variant="secondary" className="ml-2">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isInAdminArea && isAdmin ? (
              <AdminNavLinks />
            ) : (
              <NavLinks />
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Admin/User Mode Toggle */}
            {isAuthenticated && isAdmin && (
              <div className="hidden md:flex items-center gap-2">
                {!isInAdminArea ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    User Mode
                  </Button>
                )}
              </div>
            )}

            <ModeToggle />

            {/* Cart Button - Only show in user mode */}
            {isAuthenticated && !isInAdminArea && (
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
                      {isAdmin && (
                        <Badge variant="secondary" className="w-fit">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* User Actions */}
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <History className="mr-2 h-4 w-4" />
                    Riwayat Pesanan
                  </DropdownMenuItem>
                  
                  {/* Admin Actions */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => navigate('/admin')}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/orders')}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Kelola Pesanan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/menu')}>
                            <Coffee className="mr-2 h-4 w-4" />
                            Kelola Menu
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/variants')}>
                            <Sliders className="mr-2 h-4 w-4" />
                            Kelola Varian
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                            <Users className="mr-2 h-4 w-4" />
                            Kelola User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/admin/analytics')}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analytics
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </>
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
                  {/* Mode indicator */}
                  {isInAdminArea && isAdmin && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium">Mode Admin</span>
                    </div>
                  )}
                  
                  {/* Navigation Links */}
                  {isInAdminArea && isAdmin ? (
                    <>
                      <AdminNavLinks mobile onLinkClick={() => setIsMobileMenuOpen(false)} />
                      <Separator />
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => {
                          navigate('/');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Kembali ke User Mode
                      </Button>
                    </>
                  ) : (
                    <>
                      <NavLinks mobile onLinkClick={() => setIsMobileMenuOpen(false)} />
                      
                      {/* Admin Panel Access for Mobile */}
                      {isAuthenticated && isAdmin && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground px-3">Admin Panel</p>
                            <Button 
                              variant="outline" 
                              className="justify-start w-full"
                              onClick={() => {
                                navigate('/admin');
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Masuk Admin Panel
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  
                  {/* Auth buttons for non-authenticated users */}
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

