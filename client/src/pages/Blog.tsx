import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowRight, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Mock blog posts data - in a real app this would come from an API
const blogPosts = [
  {
    id: "1",
    title: "The Future of AI Tools: Trends to Watch in 2024",
    excerpt: "Explore the emerging trends in AI technology and how they're shaping the future of digital tools and workflows.",
    content: "Artificial Intelligence continues to evolve at an unprecedented pace...",
    author: "Sarah Chen",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Trends",
    tags: ["AI", "Future", "Technology", "Trends"],
    featured: true,
  },
  {
    id: "2", 
    title: "How to Choose the Right AI Tool for Your Business",
    excerpt: "A comprehensive guide to evaluating and selecting AI tools that align with your business objectives and budget.",
    content: "Selecting the right AI tool for your business can be overwhelming...",
    author: "Michael Rodriguez",
    date: "2024-01-12",
    readTime: "8 min read",
    category: "Guide",
    tags: ["Business", "Selection", "Guide"],
    featured: false,
  },
  {
    id: "3",
    title: "Top 10 AI Writing Tools Compared",
    excerpt: "An in-depth comparison of the most popular AI writing assistants, including features, pricing, and use cases.",
    content: "AI writing tools have revolutionized content creation...",
    author: "Emily Johnson",
    date: "2024-01-10",
    readTime: "12 min read",
    category: "Comparison",
    tags: ["Writing", "Comparison", "Tools"],
    featured: false,
  },
  {
    id: "4",
    title: "Getting Started with AI Image Generation",
    excerpt: "Learn the basics of AI image generation, from prompt engineering to choosing the right tool for your creative needs.",
    content: "AI image generation has opened up new possibilities for creators...",
    author: "David Park",
    date: "2024-01-08",
    readTime: "6 min read",
    category: "Tutorial",
    tags: ["Image", "Tutorial", "Beginner"],
    featured: false,
  },
  {
    id: "5",
    title: "The Ethics of AI: What Tool Users Need to Know",
    excerpt: "Understanding the ethical considerations when using AI tools, from bias to privacy and responsible AI practices.",
    content: "As AI tools become more prevalent in our daily workflows...",
    author: "Dr. Lisa Thompson",
    date: "2024-01-05",
    readTime: "10 min read",
    category: "Ethics",
    tags: ["Ethics", "Privacy", "Responsibility"],
    featured: false,
  },
  {
    id: "6",
    title: "AI in Education: Transforming Learning Experiences",
    excerpt: "Discover how AI tools are revolutionizing education, from personalized learning to automated grading systems.",
    content: "The education sector is experiencing a significant transformation...",
    author: "Prof. James Wilson",
    date: "2024-01-03",
    readTime: "7 min read",
    category: "Education",
    tags: ["Education", "Learning", "Innovation"],
    featured: false,
  },
];

const categories = ["All", "Trends", "Guide", "Comparison", "Tutorial", "Ethics", "Education"];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen py-8" data-testid="blog-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="blog-title">
            AI Tools Blog
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay updated with the latest insights, tutorials, and trends in the AI tools ecosystem
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search articles, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-blog"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`category-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === "All" && searchQuery === "" && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="overflow-hidden hover:border-primary/50 transition-colors" data-testid="featured-post">
              <div className="md:flex">
                <div className="md:w-1/2 bg-gradient-to-br from-primary/20 to-secondary/20 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Badge className="mb-4">Featured Article</Badge>
                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">★</span>
                    </div>
                  </div>
                </div>
                <CardContent className="md:w-1/2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{featuredPost.category}</Badge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{featuredPost.readTime}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4 hover:text-primary transition-colors cursor-pointer">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-muted-foreground mb-6">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {featuredPost.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredPost.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button>
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {regularPosts.length === 0 ? (
            <div className="col-span-full text-center py-12" data-testid="no-posts">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or browse all categories
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            regularPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer" data-testid={`post-${post.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <div key={tag} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="gradient-border glow-effect">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Subscribe to our newsletter to get the latest articles, AI tool reviews, and industry insights delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input placeholder="Enter your email address" className="flex-1" data-testid="newsletter-email" />
                <Button data-testid="newsletter-subscribe">Subscribe</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
