import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Check, 
  X, 
  Calendar, 
  User, 
  ExternalLink, 
  Clock,
  Settings,
  BarChart3,
  Users,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Submission, Tool } from "@shared/schema";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/admin/submissions"],
    enabled: user?.email === "gp6941@vidyagyan.in",
  });

  const { data: allTools = [], isLoading: toolsLoading } = useQuery({
    queryKey: ["/api/admin/tools"],
    enabled: user?.email === "gp6941@vidyagyan.in",
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ submissionId, status, notes }: { submissionId: string; status: string; notes: string }) => {
      return apiRequest("PATCH", `/api/admin/submissions/${submissionId}`, {
        status,
        reviewNotes: notes,
      });
    },
    onSuccess: () => {
      toast({
        title: "Submission reviewed",
        description: "The submission has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
    },
    onError: () => {
      toast({
        title: "Review failed",
        description: "Failed to process the submission.",
        variant: "destructive",
      });
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: async (toolId: string) => {
      return apiRequest("DELETE", `/api/admin/tools/${toolId}`);
    },
    onSuccess: () => {
      toast({
        title: "Tool deleted",
        description: "The tool has been removed from the database.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the tool.",
        variant: "destructive",
      });
    },
  });

  if (!user || user.email !== "gp6941@vidyagyan.in") {
    return (
      <div className="min-h-screen py-8" data-testid="admin-access-denied">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You don't have permission to access the admin panel.
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter((s: Submission) => s.status === "pending");
  const approvedSubmissions = submissions.filter((s: Submission) => s.status === "approved");
  const rejectedSubmissions = submissions.filter((s: Submission) => s.status === "rejected");
  const approvedTools = allTools.filter((t: Tool) => t.approved);
  const unapprovedTools = allTools.filter((t: Tool) => !t.approved);

  const handleReview = (submissionId: string, status: "approved" | "rejected") => {
    const notes = reviewNotes[submissionId] || "";
    reviewMutation.mutate({ submissionId, status, notes });
    setReviewNotes(prev => ({ ...prev, [submissionId]: "" }));
  };

  return (
    <div className="min-h-screen py-8" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="admin-title">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage tool submissions and oversee the Velora database
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient" data-testid="pending-count">
                  {pendingSubmissions.length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Reviews</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient" data-testid="approved-count">
                  {approvedTools.length}
                </div>
                <div className="text-sm text-muted-foreground">Approved Tools</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient" data-testid="rejected-count">
                  {rejectedSubmissions.length}
                </div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient" data-testid="total-submissions">
                  {submissions.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Submissions</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" data-testid="pending-tab">
              Pending ({pendingSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="tools" data-testid="tools-tab">
              Manage Tools ({allTools.length})
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="history-tab">
              Review History
            </TabsTrigger>
          </TabsList>

          {/* Pending Submissions */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : pendingSubmissions.length === 0 ? (
                  <div className="text-center py-8" data-testid="no-pending">
                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No pending submissions</h3>
                    <p className="text-muted-foreground">All caught up! Check back later for new submissions.</p>
                  </div>
                ) : (
                  <div className="space-y-6" data-testid="pending-submissions">
                    {pendingSubmissions.map((submission: Submission) => (
                      <Card key={submission.id} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2" data-testid={`submission-name-${submission.id}`}>
                                {submission.toolName}
                              </h3>
                              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
                                {submission.category}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <div>
                              <h4 className="font-medium mb-2">Description</h4>
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {submission.description}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="w-4 h-4" />
                                  <a 
                                    href={submission.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {submission.website}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <User className="w-4 h-4" />
                                  Submitted by user {submission.submittedBy}
                                </div>
                              </div>
                            </div>
                          </div>

                          {submission.reasoning && (
                            <div className="mb-6">
                              <h4 className="font-medium mb-2">Reasoning</h4>
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {submission.reasoning}
                              </p>
                            </div>
                          )}

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Review Notes (Optional)
                              </label>
                              <Textarea
                                placeholder="Add notes about your decision..."
                                value={reviewNotes[submission.id] || ""}
                                onChange={(e) => setReviewNotes(prev => ({
                                  ...prev,
                                  [submission.id]: e.target.value
                                }))}
                                className="min-h-20"
                                data-testid={`review-notes-${submission.id}`}
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleReview(submission.id, "approved")}
                                disabled={reviewMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                                data-testid={`approve-${submission.id}`}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReview(submission.id, "rejected")}
                                disabled={reviewMutation.isPending}
                                variant="destructive"
                                data-testid={`reject-${submission.id}`}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tools */}
          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>Manage Tools</CardTitle>
              </CardHeader>
              <CardContent>
                {toolsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="tools-list">
                    {allTools.map((tool: Tool) => (
                      <Card key={tool.id} className={`border-l-4 ${tool.approved ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">{tool.name.charAt(0)}</span>
                              </div>
                              <div>
                                <h3 className="font-semibold" data-testid={`tool-name-${tool.id}`}>
                                  {tool.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">{tool.category}</p>
                              </div>
                              <Badge 
                                className={tool.approved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                              >
                                {tool.approved ? 'Approved' : 'Draft'}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" asChild>
                                <Link href={`/tools/${tool.id}`}>View</Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteToolMutation.mutate(tool.id)}
                                disabled={deleteToolMutation.isPending}
                                data-testid={`delete-tool-${tool.id}`}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Review History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="review-history">
                  {[...approvedSubmissions, ...rejectedSubmissions]
                    .sort((a, b) => new Date(b.reviewedAt || b.createdAt).getTime() - new Date(a.reviewedAt || a.createdAt).getTime())
                    .map((submission: Submission) => (
                    <Card key={submission.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold" data-testid={`history-name-${submission.id}`}>
                              {submission.toolName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {submission.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={submission.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                            >
                              {submission.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {submission.reviewNotes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">{submission.reviewNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
