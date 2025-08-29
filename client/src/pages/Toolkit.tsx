import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Search, Filter, Star, ExternalLink, Trash2, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Tool } from "@shared/schema";

export default function Toolkit() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: allTools = [], isLoading } = useQuery({
    queryKey: ["/api/tools"],
  });

  const favoriteTools = useMemo(() => {
    if (!user?.favorites) return [];
    return allTools.filter((tool: Tool) => user.favorites.includes(tool.id));
  }, [allTools, user?.favorites]);

  const filteredAndSortedTools = useMemo(() => {
    let filtered = favoriteTools.filter((tool: Tool) => {
      const matchesSearch = searchQuery === "" || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || 
        tool.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    // Sort tools
    filtered.sort((a: Tool, b: Tool) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.rating - a.rating;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [favoriteTools, searchQuery, selectedCategory, sortBy]);

  const removeFavoriteMutation = useMutation({
    mutationFn: async (toolId: string) => {
      return apiRequest("PATCH", "/api/user/favorites", { toolId, action: "remove" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
      toast({
        title: "Removed from toolkit",
        description: "Tool has been removed from your toolkit.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove tool from toolkit.",
        variant: "destructive",
      });
    },
  });

  const categories = useMemo(() => {
    const uniqueCategories = new Set(favoriteTools.map((tool: Tool) => tool.category));
    return ["all", ...Array.from(uniqueCategories)];
  }, [favoriteTools]);

  if (!user) {
    return (
      <div className="min-h-screen py-8" data-testid="toolkit-login-required">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">
            Please log in to access your personal AI toolkit and save your favorite tools.
          </p>
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" data-testid="toolkit-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="toolkit-title">
            My AI Toolkit
          </h1>
          <p className="text-muted-foreground text-lg">
            Your curated collection of favorite AI tools - {favoriteTools.length} tools saved
          </p>
        </motion.div>

        {favoriteTools.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            data-testid="empty-toolkit"
          >
            <Heart className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Your toolkit is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start building your AI toolkit by exploring our tools and saving the ones you love
            </p>
            <Button asChild>
              <Link href="/discover">Discover AI Tools</Link>
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Filters and Controls */}
            <motion.div
              className="bg-card border border-border rounded-xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search your saved tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-toolkit"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48" data-testid="category-filter">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40" data-testid="sort-select">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    data-testid="grid-view"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    data-testid="list-view"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-muted-foreground" data-testid="results-count">
                {filteredAndSortedTools.length} of {favoriteTools.length} tools
              </p>
            </motion.div>

            {/* Tools Display */}
            {filteredAndSortedTools.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                data-testid="no-results"
              >
                <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tools found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {filteredAndSortedTools.map((tool: Tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    {viewMode === "grid" ? (
                      <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg" data-testid={`tool-card-${tool.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-lg">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                                {tool.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">{tool.category}</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeFavoriteMutation.mutate(tool.id)}
                              disabled={removeFavoriteMutation.isPending}
                              data-testid={`remove-favorite-${tool.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {tool.shortDescription}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{tool.rating.toFixed(1)}</span>
                            </div>
                            <Badge 
                              className={
                                tool.pricing === 'Free' ? 'bg-green-500/20 text-green-400' :
                                tool.pricing === 'Paid' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-blue-500/20 text-blue-400'
                              }
                            >
                              {tool.pricing}
                            </Badge>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" asChild className="flex-1">
                              <Link href={`/tools/${tool.id}`}>View Details</Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={tool.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="hover:border-primary/50 transition-colors" data-testid={`tool-list-${tool.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xl">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                    {tool.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{tool.category}</p>
                                </div>
                                <Badge 
                                  className={
                                    tool.pricing === 'Free' ? 'bg-green-500/20 text-green-400' :
                                    tool.pricing === 'Paid' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  }
                                >
                                  {tool.pricing}
                                </Badge>
                              </div>
                              
                              <p className="text-muted-foreground mb-3 line-clamp-1">
                                {tool.shortDescription}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm font-medium">{tool.rating.toFixed(1)}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {tool.usageCount || 0} users
                                  </span>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button size="sm" asChild>
                                    <Link href={`/tools/${tool.id}`}>View Details</Link>
                                  </Button>
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={tool.website} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFavoriteMutation.mutate(tool.id)}
                                    disabled={removeFavoriteMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
