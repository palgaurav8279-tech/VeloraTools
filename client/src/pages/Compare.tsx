import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, X, ArrowLeft, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tool } from "@shared/schema";

export default function Compare() {
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allTools = [], isLoading } = useQuery({
    queryKey: ["/api/tools"],
  });

  const availableTools = useMemo(() => {
    return allTools.filter((tool: Tool) => 
      !selectedTools.find(selected => selected.id === tool.id) &&
      (searchQuery === "" || tool.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allTools, selectedTools, searchQuery]);

  const addTool = (tool: Tool) => {
    if (selectedTools.length < 3) {
      setSelectedTools([...selectedTools, tool]);
      setSearchQuery("");
    }
  };

  const removeTool = (toolId: string) => {
    setSelectedTools(selectedTools.filter(tool => tool.id !== toolId));
  };

  const comparisonData = useMemo(() => {
    if (selectedTools.length === 0) return [];

    const features = new Set<string>();
    selectedTools.forEach(tool => {
      tool.features.forEach(feature => features.add(feature));
      tool.pros.forEach(pro => features.add(pro));
      tool.cons.forEach(con => features.add(con));
    });

    return Array.from(features);
  }, [selectedTools]);

  return (
    <div className="min-h-screen py-8" data-testid="compare-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4" data-testid="back-button">
            <Link href="/discover">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discover
            </Link>
          </Button>
          
          <h1 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="compare-title">
            Compare AI Tools
          </h1>
          <p className="text-muted-foreground text-lg">
            Compare features, pricing, and capabilities side by side
          </p>
        </div>

        {/* Tool Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Tools to Compare (Max 3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              {selectedTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2"
                  data-testid={`selected-tool-${tool.id}`}
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{tool.name.charAt(0)}</span>
                  </div>
                  <span className="font-medium">{tool.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-4 h-4 p-0"
                    onClick={() => removeTool(tool.id)}
                    data-testid={`remove-tool-${tool.id}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {selectedTools.length < 3 && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search tools to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                    data-testid="search-tools-input"
                  />
                  {searchQuery && availableTools.length > 0 && (
                    <Select onValueChange={(value) => {
                      const tool = availableTools.find(t => t.id === value);
                      if (tool) addTool(tool);
                    }}>
                      <SelectTrigger className="w-48" data-testid="tool-selector">
                        <SelectValue placeholder="Select a tool" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTools.slice(0, 10).map((tool: Tool) => (
                          <SelectItem key={tool.id} value={tool.id}>
                            {tool.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
            
            {selectedTools.length === 0 && (
              <p className="text-muted-foreground text-center py-8" data-testid="no-tools-message">
                Start by searching and selecting tools to compare
              </p>
            )}
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedTools.length > 0 && (
          <Card data-testid="comparison-table">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-6 w-48">Feature</th>
                      {selectedTools.map((tool) => (
                        <th key={tool.id} className="text-center p-6 min-w-80" data-testid={`tool-header-${tool.id}`}>
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mb-3">
                              <span className="text-white font-bold">{tool.name.charAt(0)}</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{tool.category}</p>
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
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Basic Info */}
                    <tr className="border-b border-border">
                      <td className="p-6 font-medium">Description</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-6 text-sm text-muted-foreground" data-testid={`description-${tool.id}`}>
                          {tool.shortDescription}
                        </td>
                      ))}
                    </tr>
                    
                    <tr className="border-b border-border">
                      <td className="p-6 font-medium">Rating</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-6 text-center" data-testid={`rating-${tool.id}`}>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-yellow-400">{'★'.repeat(Math.floor(tool.rating))}</span>
                            <span className="font-medium">{tool.rating.toFixed(1)}</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="p-6 font-medium">Users</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-6 text-center" data-testid={`users-${tool.id}`}>
                          {tool.usageCount || 0}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="p-6 font-medium">Website</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-6 text-center" data-testid={`website-${tool.id}`}>
                          <Button size="sm" asChild>
                            <a href={tool.website} target="_blank" rel="noopener noreferrer">
                              Visit
                            </a>
                          </Button>
                        </td>
                      ))}
                    </tr>

                    {/* Features Comparison */}
                    {comparisonData.length > 0 && (
                      <>
                        <tr className="border-b border-border bg-muted/30">
                          <td colSpan={selectedTools.length + 1} className="p-6 font-semibold">
                            Features & Capabilities
                          </td>
                        </tr>
                        {comparisonData.map((feature) => (
                          <tr key={feature} className="border-b border-border">
                            <td className="p-6 text-sm">{feature}</td>
                            {selectedTools.map((tool) => (
                              <td key={tool.id} className="p-6 text-center" data-testid={`feature-${feature}-${tool.id}`}>
                                {tool.features.includes(feature) || tool.pros.includes(feature) ? (
                                  <Check className="w-5 h-5 text-green-400 mx-auto" />
                                ) : tool.cons.includes(feature) ? (
                                  <Minus className="w-5 h-5 text-red-400 mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </>
                    )}

                    {/* Actions */}
                    <tr>
                      <td className="p-6 font-medium">Actions</td>
                      {selectedTools.map((tool) => (
                        <td key={tool.id} className="p-6" data-testid={`actions-${tool.id}`}>
                          <div className="flex flex-col gap-2">
                            <Button asChild size="sm">
                              <Link href={`/tools/${tool.id}`}>View Details</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={tool.website} target="_blank" rel="noopener noreferrer">
                                Try Now
                              </a>
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Compare Suggestions */}
        {selectedTools.length === 0 && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Popular Comparisons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTools.slice(0, 6).map((tool: Tool) => (
                  <div
                    key={tool.id}
                    className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => addTool(tool)}
                    data-testid={`quick-add-${tool.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{tool.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{tool.name}</h4>
                        <p className="text-sm text-muted-foreground">{tool.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
