import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Send, Users, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSubmissionSchema } from "@shared/schema";
import type { Submission } from "@shared/schema";

const categories = [
  "Text Generation",
  "Image Generation", 
  "Video Editing",
  "Code Generation",
  "Music Creation",
  "Productivity",
  "Business",
  "Education",
  "Design",
  "Analytics"
];

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("submit");

  const form = useForm({
    resolver: zodResolver(insertSubmissionSchema.omit({ submittedBy: true })),
    defaultValues: {
      toolName: "",
      description: "",
      category: "",
      website: "",
      reasoning: "",
    },
  });

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["/api/submissions"],
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/submissions", data);
    },
    onSuccess: () => {
      toast({
        title: "Tool submitted successfully!",
        description: "Your submission will be reviewed by our team.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to submit tools.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "rejected":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <div className="min-h-screen py-8" data-testid="community-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="community-title">
            Community Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Help grow our AI tools database by submitting new tools and engaging with the community
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient" data-testid="community-members">2,847</div>
                <div className="text-sm text-muted-foreground">Community Members</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient" data-testid="tools-submitted">{submissions.length}</div>
                <div className="text-sm text-muted-foreground">Tools Submitted</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient" data-testid="approved-submissions">
                  {submissions.filter((s: Submission) => s.status === "approved").length}
                </div>
                <div className="text-sm text-muted-foreground">Approved This Month</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submit" data-testid="submit-tab">Submit Tool</TabsTrigger>
            <TabsTrigger value="submissions" data-testid="submissions-tab">My Submissions</TabsTrigger>
          </TabsList>

          {/* Submit Tool Tab */}
          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Submit a New AI Tool
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-8" data-testid="login-required">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Login Required</h3>
                    <p className="text-muted-foreground mb-4">
                      Please log in to submit tools to our community database
                    </p>
                    <Button asChild>
                      <a href="/login">Log In</a>
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="submit-form">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="toolName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tool Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., ChatGPT, Midjourney" {...field} data-testid="tool-name-input" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="category-select">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com" 
                                type="url" 
                                {...field} 
                                data-testid="website-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this tool does, its key features, and how it can help users..."
                                className="min-h-32"
                                {...field}
                                data-testid="description-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reasoning"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Why should this tool be added? (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explain why this tool would be valuable to our community..."
                                {...field}
                                data-testid="reasoning-input"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="w-full"
                        data-testid="submit-button"
                      >
                        {submitMutation.isPending ? (
                          "Submitting..."
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Tool
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Submissions Tab */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>My Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-8" data-testid="login-required-submissions">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Login Required</h3>
                    <p className="text-muted-foreground">
                      Please log in to view your submissions
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8" data-testid="no-submissions">
                    <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by submitting your first AI tool to help grow our community
                    </p>
                    <Button onClick={() => setActiveTab("submit")}>
                      Submit Your First Tool
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="submissions-list">
                    {submissions.map((submission: Submission) => (
                      <Card key={submission.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg" data-testid={`submission-name-${submission.id}`}>
                                  {submission.toolName}
                                </h3>
                                <Badge className={getStatusColor(submission.status)}>
                                  {submission.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {submission.category}
                              </p>
                              <p className="text-muted-foreground mb-3 line-clamp-2">
                                {submission.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(submission.createdAt).toLocaleDateString()}
                                </div>
                                <a 
                                  href={submission.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Visit Website
                                </a>
                              </div>
                            </div>
                          </div>
                          
                          {submission.reviewNotes && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm">
                                <span className="font-medium">Review Notes: </span>
                                {submission.reviewNotes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Community Guidelines */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">✅ What to Submit</h4>
                  <ul className="space-y-1">
                    <li>• Legitimate AI tools and services</li>
                    <li>• Tools that add value to the community</li>
                    <li>• Accurate descriptions and information</li>
                    <li>• Working website URLs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">❌ What Not to Submit</h4>
                  <ul className="space-y-1">
                    <li>• Duplicate tools already in our database</li>
                    <li>• Non-AI related tools</li>
                    <li>• Spam or promotional content</li>
                    <li>• Incomplete or inaccurate information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
