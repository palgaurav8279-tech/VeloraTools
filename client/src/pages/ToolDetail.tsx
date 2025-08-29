import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Heart, Star, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Tool } from "@shared/schema";

export default function ToolDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tool, isLoading } = useQuery({
    queryKey: ["/api/tools", id],
    enabled: !!id,
  });

  const { data: relatedTools = [] } = useQuery({
    queryKey: ["/api/tools", { category: tool?.category }],
    enabled: !!tool?.category,
  });

  const favoriteMutation = useMutation({
    mutationFn: async (action: "add" | "remove") => {
      return apiRequest("PATCH", "/api/user/favorites", { toolId: id, action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
      toast({
        title: "Favorites updated",
        description: "Your toolkit has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-8" data-testid="tool-detail-loading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="flex gap-8 mb-8">
              <div className="w-20 h-20 bg-muted rounded-xl"></div>
              <div className="flex-1">
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen py-8" data-testid="tool-not-found">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Tool not found</h1>
          <p className="text-muted-foreground mb-8">The tool you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/discover">Back to Discover</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isFavorited = user?.favorites?.includes(tool.id);
  const similarTools = relatedTools
    .filter((t: Tool) => t.id !== tool.id)
    .slice(0, 3);

  const handleFavorite = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save tools to your toolkit.",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate(isFavorited ? "remove" : "add");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool.name,
          text: tool.shortDescription,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Tool link has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen py-8" data-testid="tool-detail-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-8" data-testid="back-button">
          <Link href="/discover">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Link>
        </Button>

        {/* Tool Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">
              {tool.name.charAt(0)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2" data-testid="tool-name">
                  {tool.name}
                </h1>
                <p className="text-muted-foreground text-lg mb-2" data-testid="tool-category">
                  {tool.category}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-medium" data-testid="tool-rating">
                      {tool.rating.toFixed(1)}
                    </span>
                  </div>
                  <Badge 
                    className={
                      tool.pricing === 'Free' ? 'bg-green-500/20 text-green-400' :
                      tool.pricing === 'Paid' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }
                    data-testid="tool-pricing"
                  >
                    {tool.pricing}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {tool.usageCount || 0} users
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFavorite}
                  disabled={favoriteMutation.isPending}
                  data-testid="favorite-button"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  data-testid="share-button"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button asChild className="flex-1" data-testid="visit-website">
                <a href={tool.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </a>
              </Button>
              <Button variant="outline" asChild data-testid="compare-button">
                <Link href={`/compare?tools=${tool.id}`}>
                  Compare
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed" data-testid="tool-description">
                  {tool.description}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            {tool.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2" data-testid="tool-features">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Pros & Cons */}
            {(tool.pros.length > 0 || tool.cons.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Pros & Cons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tool.pros.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-400 mb-3">Pros</h4>
                        <ul className="space-y-2" data-testid="tool-pros">
                          {tool.pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-400 text-sm">+</span>
                              <span className="text-muted-foreground text-sm">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {tool.cons.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-400 mb-3">Cons</h4>
                        <ul className="space-y-2" data-testid="tool-cons">
                          {tool.cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-400 text-sm">-</span>
                              <span className="text-muted-foreground text-sm">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {tool.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2" data-testid="tool-tags">
                    {tool.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Similar Tools */}
            {similarTools.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="similar-tools">
                    {similarTools.map((similarTool: Tool) => (
                      <Link key={similarTool.id} href={`/tools/${similarTool.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {similarTool.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{similarTool.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {similarTool.shortDescription}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
