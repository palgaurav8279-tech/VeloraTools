import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Filter, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@shared/schema";

export default function Discover() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPricing, setSelectedPricing] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["/api/tools"],
  });

  const filteredAndSortedTools = useMemo(() => {
    let filtered = tools.filter((tool: Tool) => {
      const matchesSearch = searchQuery === "" || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || 
        tool.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesPricing = selectedPricing === "all" || 
        tool.pricing === selectedPricing;

      return matchesSearch && matchesCategory && matchesPricing;
    });

    // Sort tools
    filtered.sort((a: Tool, b: Tool) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.rating - a.rating;
        case "usage":
          return (b.usageCount || 0) - (a.usageCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tools, searchQuery, selectedCategory, selectedPricing, sortBy]);

  const handleToolClick = (toolId: string) => {
    setLocation(`/tools/${toolId}`);
  };

  return (
    <div className="min-h-screen py-8" data-testid="discover-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="discover-title">
            Discover AI Tools
          </h1>
          <p className="text-muted-foreground text-lg">
            Find the perfect AI tool for your needs from our curated collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tools, features, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-tools"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>

            {/* Pricing Filter */}
            <Select value={selectedPricing} onValueChange={setSelectedPricing}>
              <SelectTrigger data-testid="pricing-filter">
                <SelectValue placeholder="Pricing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pricing</SelectItem>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Freemium">Freemium</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="sort-select">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="usage">Popularity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground" data-testid="results-count">
            {filteredAndSortedTools.length} tools found
          </p>
          {(searchQuery || selectedCategory !== "all" || selectedPricing !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedPricing("all");
              }}
              data-testid="clear-filters"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Tools Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="w-12 h-6 bg-muted rounded"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedTools.length === 0 ? (
          <div className="text-center py-12" data-testid="no-results">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedPricing("all");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTools.map((tool: Tool) => (
              <Card 
                key={tool.id}
                className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => handleToolClick(tool.id)}
                data-testid={`tool-card-${tool.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {tool.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors" data-testid={`tool-name-${tool.id}`}>
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`tool-category-${tool.id}`}>
                        {tool.category}
                      </p>
                    </div>
                    <Badge 
                      variant={tool.pricing === 'Free' ? 'secondary' : 'default'}
                      className={
                        tool.pricing === 'Free' ? 'bg-green-500/20 text-green-400' :
                        tool.pricing === 'Paid' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }
                      data-testid={`tool-pricing-${tool.id}`}
                    >
                      {tool.pricing}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`tool-description-${tool.id}`}>
                    {tool.shortDescription}
                  </p>

                  {tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {tool.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{tool.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium" data-testid={`tool-rating-${tool.id}`}>
                        {tool.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({tool.usageCount || 0} users)
                      </span>
                    </div>
                    <Button size="sm" data-testid={`tool-view-button-${tool.id}`}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
