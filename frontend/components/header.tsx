"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Gavel, Heart } from "lucide-react";
import { Button } from "@mui/material";
import LogoutButton from "@/components/LogoutButton";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
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
            <Button variant="text" size="small" className="!text-gray-700">
              <Heart className="h-4 w-4 mr-2 text-primary" />
              Watchlist
            </Button>
            <LogoutButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-primary focus:outline-none cursor-pointer"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay Dropdown */}
      {isMenuOpen && (
        <div
          className="absolute right-5 right-0 top-16 z-40 bg-white shadow-lg border-t animate-slide-down md:hidden w-fit items-end"
        >
          <nav className="flex flex-col p-4 space-y-3 ">
            <Link
              href="/"
              onClick={closeMenu}
              className="text-base font-medium text-gray-700 hover:text-primary"
            >
              Gallery
            </Link>
            <Link
              href="/my-bids"
              onClick={closeMenu}
              className="text-base font-medium text-gray-700 hover:text-primary"
            >
              My Bids
            </Link>
            <Link
              href="/won"
              onClick={closeMenu}
              className="text-base font-medium text-gray-700 hover:text-primary"
            >
              Won Items
            </Link>

            <div className="border-t pt-3 space-y-2 ">
              <Button
                variant="text"
                size="small"
                className="!text-gray-700 justify-start w-full"
              >
                <Heart className="h-4 w-4 mr-2 text-primary" />
                Watchlist
              </Button>
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
