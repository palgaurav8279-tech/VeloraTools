import { z } from "zod";

// User schemas
export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().optional(),
  googleId: z.string().optional(),
  avatar: z.string().optional(),
  favorites: z.array(z.string()).default([]),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  createdAt: z.string(),
});

// AI Tool schemas
export const insertToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  category: z.string().min(1),
  pricing: z.enum(["Free", "Paid", "Freemium"]),
  website: z.string().url(),
  logo: z.string().optional(),
  screenshots: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(0),
  usageCount: z.number().default(0),
  tags: z.array(z.string()).default([]),
});

export const toolSchema = insertToolSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  approved: z.boolean().default(false),
});

// Tool submission schemas
export const insertSubmissionSchema = z.object({
  toolName: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  website: z.string().url(),
  submittedBy: z.string(),
  reasoning: z.string().optional(),
});

export const submissionSchema = insertSubmissionSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewNotes: z.string().optional(),
});

// Newsletter schema
export const newsletterSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  subscribedAt: z.string(),
  active: z.boolean().default(true),
});

// OTP schema
export const otpSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  otp: z.string(),
  expiresAt: z.string(),
  attempts: z.number().default(0),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const otpLoginSchema = z.object({
  email: z.string().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type Newsletter = z.infer<typeof newsletterSchema>;
export type OTP = z.infer<typeof otpSchema>;
