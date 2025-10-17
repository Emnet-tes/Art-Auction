"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Gavel, User, Heart } from "lucide-react";
import { Button } from "@mui/material";
import { login } from "@/lib/api";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogin = async () => {
    // Simple login prompt (replace with proper form)
    const username = prompt("Username:");
    const password = prompt("Password:");
    if (username && password) {
      try {
        await login(username, password);
        setIsLoggedIn(true);
      } catch (error) {
        alert("Login failed");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Gavel className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl font-bold tracking-tight">
              Artisan Auctions
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Gallery
            </Link>
            <Link
              href="/my-bids"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              My Bids
            </Link>
            <Link
              href="/won"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Won Items
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="text" size="small">
              <Heart className="h-4 w-4 mr-2" />
              Watchlist
            </Button>
            {isLoggedIn ? (
              <Button variant="outlined" size="small" onClick={handleLogout}>
                <User className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button variant="outlined" size="small" onClick={handleLogin}>
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="text"
            size="small"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link
                href="/my-bids"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bids
              </Link>
              <Link
                href="/won"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Won Items
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="text" size="small" className="justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Watchlist
                </Button>
                {isLoggedIn ? (
                  <Button
                    variant="outlined"
                    size="small"
                    className="justify-start bg-transparent"
                    onClick={handleLogout}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    className="justify-start bg-transparent"
                    onClick={handleLogin}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
