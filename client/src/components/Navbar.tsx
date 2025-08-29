import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" data-testid="logo-link">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-gradient">Velora</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              data-testid="nav-home"
            >
              Home
            </Link>
            <Link 
              href="/discover" 
              className={`transition-colors ${isActive('/discover') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              data-testid="nav-discover"
            >
              Discover
            </Link>
            <Link 
              href="/compare" 
              className={`transition-colors ${isActive('/compare') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              data-testid="nav-compare"
            >
              Compare
            </Link>
            <Link 
              href="/community" 
              className={`transition-colors ${isActive('/community') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              data-testid="nav-community"
            >
              Community
            </Link>
            <Link 
              href="/blog" 
              className={`transition-colors ${isActive('/blog') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              data-testid="nav-blog"
            >
              Blog
            </Link>
            {user && (
              <Link 
                href="/toolkit" 
                className={`transition-colors ${isActive('/toolkit') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                data-testid="nav-toolkit"
              >
                My Toolkit
              </Link>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
              data-testid="theme-toggle"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {/* User Menu or Login */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg" data-testid="user-menu">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/toolkit" data-testid="menu-toolkit">My Toolkit</Link>
                  </DropdownMenuItem>
                  {user.email === "gp6941@vidyagyan.in" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="menu-admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild data-testid="login-button">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
            
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden rounded-lg" data-testid="mobile-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
