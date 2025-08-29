import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import nodemailer from "nodemailer";
import { storage } from "./storage";
import {
  loginSchema,
  registerSchema,
  otpLoginSchema,
  verifyOtpSchema,
  insertToolSchema,
  insertSubmissionSchema,
  newsletterSchema,
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "velora_secret_key";
const ADMIN_EMAIL = "gp6941@vidyagyan.in";

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

// Passport configuration (only if Google OAuth is configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (!user) {
        user = await storage.createUser({
          username: profile.displayName || profile.emails?.[0]?.value || '',
          email: profile.emails?.[0]?.value || '',
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value,
          favorites: [],
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }));
}

// Middleware to verify JWT
const verifyToken = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin middleware
const verifyAdmin = (req: any, res: any, next: any) => {
  if (req.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(passport.initialize());

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        favorites: [],
      });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(400).json({ message: 'Invalid login data' });
    }
  });

  app.post('/api/auth/otp/send', async (req, res) => {
    try {
      const { email } = otpLoginSchema.parse(req.body);
      
      const otp = Math.random().toString().slice(2, 8);
      await storage.createOTP(email, otp);
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Velora Login Code',
        text: `Your login code is: ${otp}. This code expires in 10 minutes.`,
      });
      
      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  });

  app.post('/api/auth/otp/verify', async (req, res) => {
    try {
      const { email, otp } = verifyOtpSchema.parse(req.body);
      
      const storedOTP = await storage.getOTP(email);
      if (!storedOTP) {
        return res.status(401).json({ message: 'Invalid or expired OTP' });
      }
      
      if (storedOTP.attempts >= 3) {
        await storage.deleteOTP(email);
        return res.status(401).json({ message: 'Too many attempts. Please request a new OTP.' });
      }
      
      if (storedOTP.otp !== otp) {
        await storage.incrementOTPAttempts(email);
        return res.status(401).json({ message: 'Invalid OTP' });
      }
      
      await storage.deleteOTP(email);
      
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          username: email.split('@')[0],
          email,
          favorites: [],
        });
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(400).json({ message: 'Invalid OTP verification data' });
    }
  });

  // Google OAuth routes
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { session: false }),
    (req: any, res) => {
      const token = jwt.sign({ userId: req.user.id }, JWT_SECRET);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5000'}?token=${token}`);
    }
  );

  // User routes
  app.get('/api/user/me', verifyToken, (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  app.patch('/api/user/favorites', verifyToken, async (req: any, res) => {
    try {
      const { toolId, action } = req.body;
      const user = req.user;
      
      let favorites = user.favorites || [];
      if (action === 'add' && !favorites.includes(toolId)) {
        favorites.push(toolId);
      } else if (action === 'remove') {
        favorites = favorites.filter((id: string) => id !== toolId);
      }
      
      const updatedUser = await storage.updateUser(user.id, { favorites });
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update favorites' });
    }
  });

  // Tool routes
  app.get('/api/tools', async (req, res) => {
    try {
      const { category, search } = req.query;
      let tools;
      
      if (search) {
        tools = await storage.searchTools(search as string);
      } else if (category) {
        tools = await storage.getToolsByCategory(category as string);
      } else {
        tools = await storage.getApprovedTools();
      }
      
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tools' });
    }
  });

  app.get('/api/tools/:id', async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.id);
      if (!tool || !tool.approved) {
        return res.status(404).json({ message: 'Tool not found' });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tool' });
    }
  });

  app.get('/api/tools/trending', async (req, res) => {
    try {
      const tools = await storage.getApprovedTools();
      const trending = tools
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 6);
      res.json(trending);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch trending tools' });
    }
  });

  // Newsletter routes
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email } = req.body;
      await storage.subscribeNewsletter(email);
      res.json({ message: 'Successfully subscribed to newsletter' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to subscribe to newsletter' });
    }
  });

  // Submission routes
  app.post('/api/submissions', verifyToken, async (req: any, res) => {
    try {
      const submissionData = insertSubmissionSchema.parse({
        ...req.body,
        submittedBy: req.user.id,
      });
      
      const submission = await storage.createSubmission(submissionData);
      res.json(submission);
    } catch (error) {
      res.status(400).json({ message: 'Invalid submission data' });
    }
  });

  // Admin routes
  app.get('/api/admin/submissions', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  });

  app.patch('/api/admin/submissions/:id', verifyToken, verifyAdmin, async (req: any, res) => {
    try {
      const { status, reviewNotes } = req.body;
      const submission = await storage.updateSubmission(req.params.id, {
        status,
        reviewNotes,
        reviewedBy: req.user.id,
        reviewedAt: new Date().toISOString(),
      });
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      // If approved, create the tool
      if (status === 'approved') {
        await storage.createTool({
          name: submission.toolName,
          description: submission.description,
          shortDescription: submission.description.slice(0, 100),
          category: submission.category,
          website: submission.website,
          pricing: 'Free',
          features: [],
          pros: [],
          cons: [],
          rating: 0,
          usageCount: 0,
          tags: [],
        });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update submission' });
    }
  });

  app.get('/api/admin/tools', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tools' });
    }
  });

  app.patch('/api/admin/tools/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const updates = req.body;
      const tool = await storage.updateTool(req.params.id, updates);
      
      if (!tool) {
        return res.status(404).json({ message: 'Tool not found' });
      }
      
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update tool' });
    }
  });

  app.delete('/api/admin/tools/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteTool(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Tool not found' });
      }
      res.json({ message: 'Tool deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete tool' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
