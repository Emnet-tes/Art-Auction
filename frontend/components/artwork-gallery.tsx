"use client"

import { useState, useMemo } from "react"
import { ArtworkCard } from "@/components/artwork-card"
import { SearchFilters } from "@/components/search-filters"
import { mockArtworks } from "@/lib/mock-data"

export function ArtworkGallery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState({ min: 0, max: Number.POSITIVE_INFINITY })

  // Filter artworks based on search and filters
  const filteredArtworks = useMemo(() => {
    return mockArtworks.filter((artwork) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.artist.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = selectedCategory === "" || artwork.category === selectedCategory

      // Price range filter
      const matchesPrice = artwork.currentBid >= priceRange.min && artwork.currentBid <= priceRange.max

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [searchQuery, selectedCategory, priceRange])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max })
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <SearchFilters
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onPriceRangeChange={handlePriceRangeChange}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-semibold">Current Auctions</h2>
        <p className="text-muted-foreground">
          {filteredArtworks.length} {filteredArtworks.length === 1 ? "artwork" : "artworks"} available
        </p>
      </div>

      {/* Gallery Grid */}
      {filteredArtworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No artworks match your current filters.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  )
}
