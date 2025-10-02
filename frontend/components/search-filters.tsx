"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Chip,
  InputLabel,
  FormControl,
} from "@mui/material";

interface SearchFiltersProps {
  onSearchChange?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onPriceRangeChange?: (min: number, max: number) => void;
}

export function SearchFilters({
  onSearchChange,
  onCategoryChange,
  onPriceRangeChange,
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange?.(value);

    if (value && !activeFilters.includes(value)) {
      setActiveFilters([...activeFilters, value]);
    }
  };

  const handlePriceRangeChange = (type: "min" | "max", value: string) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);

    if (newRange.min && newRange.max) {
      onPriceRangeChange?.(
        Number.parseInt(newRange.min),
        Number.parseInt(newRange.max)
      );
      const filterLabel = `$${newRange.min} - $${newRange.max}`;
      if (!activeFilters.includes(filterLabel)) {
        setActiveFilters([...activeFilters, filterLabel]);
      }
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));

    // Reset corresponding filter
    if (["Painting", "Sculpture", "Digital", "Photography"].includes(filter)) {
      setSelectedCategory("");
      onCategoryChange?.("");
    } else if (filter.includes("$")) {
      setPriceRange({ min: "", max: "" });
      onPriceRangeChange?.(0, Number.POSITIVE_INFINITY);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSearchQuery("");
    onCategoryChange?.("");
    onPriceRangeChange?.(0, Number.POSITIVE_INFINITY);
    onSearchChange?.("");
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <TextField
          placeholder="Search by artwork title or artist name..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-12 text-base"
          fullWidth
          variant="outlined"
          size="small"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Category Filter */}
          <FormControl size="small" className="w-[180px]">
            <InputLabel>
              <Filter className="h-4 w-4 mr-2" />
              Category
            </InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              label="Category"
              displayEmpty
            >
              <MenuItem value="">
                <em>Category</em>
              </MenuItem>
              <MenuItem value="Painting">Painting</MenuItem>
              <MenuItem value="Sculpture">Sculpture</MenuItem>
              <MenuItem value="Digital">Digital Art</MenuItem>
              <MenuItem value="Photography">Photography</MenuItem>
            </Select>
          </FormControl>

          {/* Price Range Filters */}
          <div className="flex items-center gap-2">
            <TextField
              placeholder="Min price"
              type="number"
              value={priceRange.min}
              onChange={(e) => handlePriceRangeChange("min", e.target.value)}
              className="w-24"
              size="small"
              variant="outlined"
            />
            <span className="text-muted-foreground">-</span>
            <TextField
              placeholder="Max price"
              type="number"
              value={priceRange.max}
              onChange={(e) => handlePriceRangeChange("max", e.target.value)}
              className="w-24"
              size="small"
              variant="outlined"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {activeFilters.length > 0 && (
          <Button
            variant="outlined"
            onClick={clearAllFilters}
            className="whitespace-nowrap bg-transparent"
            size="small"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              color="secondary"
              className="px-3 py-1"
              onDelete={() => removeFilter(filter)}
              deleteIcon={<X className="h-3 w-3" />}
              size="small"
            />
          ))}
        </div>
      )}
    </div>
  );
}
