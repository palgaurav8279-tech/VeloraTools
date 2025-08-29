import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Sparkles, Zap, Code, Image, Video, Music, Briefcase, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Tool } from "@shared/schema";

const categories = [
  { id: "text", name: "Text", icon: Sparkles, gradient: "from-blue-500 to-purple-500" },
  { id: "image", name: "Image", icon: Image, gradient: "from-pink-500 to-red-500" },
  { id: "video", name: "Video", icon: Video, gradient: "from-green-500 to-teal-500" },
  { id: "coding", name: "Coding", icon: Code, gradient: "from-indigo-500 to-blue-500" },
  { id: "music", name: "Music", icon: Music, gradient: "from-purple-500 to-pink-500" },
  { id: "productivity", name: "Productivity", icon: Briefcase, gradient: "from-orange-500 to-yellow-500" },
  { id: "business", name: "Business", icon: Lightbulb, gradient: "from-cyan-500 to-blue-500" },
  { id: "more", name: "More", icon: Zap, gradient: "from-gray-500 to-gray-600" },
];

const taskShortcuts = [
  { task: "logo", title: "Create a logo", description: "Design unique logos for your brand", icon: Image },
  { task: "essay", title: "Write an essay", description: "Generate well-structured essays and articles", icon: Sparkles },
  { task: "video", title: "Edit videos", description: "Create and edit professional videos", icon: Video },
  { task: "code", title: "Generate code", description: "Write code faster with AI assistance", icon: Code },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { toast } = useToast();

  const { data: trendingTools = [], isLoading } = useQuery({
    queryKey: ["/api/tools/trending"],
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/discover?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      await apiRequest("POST", "/api/newsletter/subscribe", { email: newsletterEmail });
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setNewsletterEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6" data-testid="hero-title">
              All your <span className="text-gradient">AI tools</span><br />
              at one place
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto" data-testid="hero-description">
              Discover, compare, and master the best AI tools for your projects. From content creation to code generation - find the perfect AI companion.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative gradient-border rounded-2xl glow-effect">
                <Input 
                  type="text" 
                  placeholder="What do you want to do with AI?" 
                  className="w-full px-6 py-4 bg-card text-foreground placeholder-muted-foreground rounded-2xl border-0 outline-none text-lg pr-16"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  data-testid="search-input"
                />
                <Button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  data-testid="search-button"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Search Suggestions */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {["Generate images", "Write code", "Create videos", "Edit photos"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="secondary"
                    size="sm"
                    className="px-4 py-2 bg-muted hover:bg-accent text-sm rounded-full"
                    onClick={() => setSearchQuery(suggestion)}
                    data-testid={`suggestion-${suggestion.toLowerCase().replace(' ', '-')}`}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gradient" data-testid="stat-tools">500+</div>
                <div className="text-sm text-muted-foreground">AI Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gradient" data-testid="stat-categories">25+</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center col-span-2 md:col-span-1">
                <div className="text-2xl lg:text-3xl font-bold text-gradient" data-testid="stat-users">10k+</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="categories-title">Explore by Category</h2>
            <p className="text-muted-foreground text-lg">Find the perfect AI tool for your specific needs</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link 
                  key={category.id}
                  href={`/discover?category=${category.id}`}
                  data-testid={`category-${category.id}`}
                >
                  <motion.div
                    className="group p-6 bg-card hover:bg-accent border border-border rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-r ${category.gradient} rounded-lg flex items-center justify-center group-hover:shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-medium">{category.name}</div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Trending Tools Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="trending-title">Trending AI Tools</h2>
              <p className="text-muted-foreground text-lg">The most popular tools used by our community</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Button asChild data-testid="view-all-tools">
                <Link href="/discover">View All Tools</Link>
              </Button>
            </motion.div>
          </div>
          
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
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {trendingTools.map((tool: Tool, index: number) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg" data-testid={`tool-card-${tool.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">{tool.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors" data-testid={`tool-name-${tool.id}`}>
                            {tool.name}
                          </h3>
                          <p className="text-sm text-muted-foreground" data-testid={`tool-category-${tool.id}`}>
                            {tool.category}
                          </p>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tool.pricing === 'Free' ? 'bg-green-500/20 text-green-400' :
                          tool.pricing === 'Paid' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`} data-testid={`tool-pricing-${tool.id}`}>
                          {tool.pricing}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`tool-description-${tool.id}`}>
                        {tool.shortDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="flex text-yellow-400">
                            {'★'.repeat(Math.floor(tool.rating))}{'☆'.repeat(5 - Math.floor(tool.rating))}
                          </div>
                          <span className="text-sm text-muted-foreground ml-1" data-testid={`tool-rating-${tool.id}`}>
                            {tool.rating.toFixed(1)}
                          </span>
                        </div>
                        <Button asChild size="sm" data-testid={`tool-try-button-${tool.id}`}>
                          <Link href={`/tools/${tool.id}`}>Try Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Task Finder Section */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="tasks-title">What do you need to do?</h2>
            <p className="text-muted-foreground text-lg">Quick shortcuts to find the perfect AI tool for your task</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {taskShortcuts.map((task, index) => {
              const Icon = task.icon;
              return (
                <motion.div
                  key={task.task}
                  className="group p-6 bg-card hover:bg-accent border border-border rounded-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => window.location.href = `/discover?search=${task.task}`}
                  data-testid={`task-${task.task}`}
                >
                  <div className="w-12 h-12 mb-4 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center group-hover:shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="gradient-border rounded-2xl p-12 glow-effect"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="newsletter-title">Stay ahead of the AI curve</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Get weekly updates on the latest AI tools, tutorials, and industry insights delivered straight to your inbox.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-4" data-testid="newsletter-form">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-card text-foreground placeholder-muted-foreground rounded-lg border border-border"
                required
                data-testid="newsletter-email"
              />
              <Button type="submit" className="px-6 py-3 whitespace-nowrap" data-testid="newsletter-subscribe">
                Subscribe
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
