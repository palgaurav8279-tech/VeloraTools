import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { 
  type User, 
  type InsertUser,
  type Tool,
  type InsertTool,
  type Submission,
  type InsertSubmission,
  type Newsletter,
  type OTP,
} from '@shared/schema';

const DATA_DIR = path.join(process.cwd(), 'server/data');

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Tool methods
  getTools(): Promise<Tool[]>;
  getTool(id: string): Promise<Tool | undefined>;
  getToolsByCategory(category: string): Promise<Tool[]>;
  searchTools(query: string): Promise<Tool[]>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: string, updates: Partial<Tool>): Promise<Tool | undefined>;
  deleteTool(id: string): Promise<boolean>;
  getApprovedTools(): Promise<Tool[]>;
  
  // Submission methods
  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | undefined>;
  
  // Newsletter methods
  subscribeNewsletter(email: string): Promise<Newsletter>;
  unsubscribeNewsletter(email: string): Promise<boolean>;
  getNewsletterSubscriber(email: string): Promise<Newsletter | undefined>;
  
  // OTP methods
  createOTP(email: string, otp: string): Promise<OTP>;
  getOTP(email: string): Promise<OTP | undefined>;
  deleteOTP(email: string): Promise<boolean>;
  incrementOTPAttempts(email: string): Promise<void>;
}

export class FileStorage implements IStorage {
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private async readFile<T>(filename: string): Promise<T[]> {
    await this.ensureDataDir();
    const filepath = path.join(DATA_DIR, filename);
    try {
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async writeFile<T>(filename: string, data: T[]): Promise<void> {
    await this.ensureDataDir();
    const filepath = path.join(DATA_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    return users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    return users.find(user => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    return users.find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = await this.readFile<User>('users.json');
    const user: User = {
      ...insertUser,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await this.writeFile('users.json', users);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return undefined;
    
    users[index] = { ...users[index], ...updates };
    await this.writeFile('users.json', users);
    return users[index];
  }

  // Tool methods
  async getTools(): Promise<Tool[]> {
    return this.readFile<Tool>('tools.json');
  }

  async getTool(id: string): Promise<Tool | undefined> {
    const tools = await this.readFile<Tool>('tools.json');
    return tools.find(tool => tool.id === id);
  }

  async getToolsByCategory(category: string): Promise<Tool[]> {
    const tools = await this.readFile<Tool>('tools.json');
    return tools.filter(tool => tool.category.toLowerCase() === category.toLowerCase() && tool.approved);
  }

  async searchTools(query: string): Promise<Tool[]> {
    const tools = await this.readFile<Tool>('tools.json');
    const searchTerm = query.toLowerCase();
    return tools.filter(tool => 
      tool.approved && (
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.description.toLowerCase().includes(searchTerm) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    );
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const tools = await this.readFile<Tool>('tools.json');
    const tool: Tool = {
      ...insertTool,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      approved: false,
    };
    tools.push(tool);
    await this.writeFile('tools.json', tools);
    return tool;
  }

  async updateTool(id: string, updates: Partial<Tool>): Promise<Tool | undefined> {
    const tools = await this.readFile<Tool>('tools.json');
    const index = tools.findIndex(tool => tool.id === id);
    if (index === -1) return undefined;
    
    tools[index] = { ...tools[index], ...updates };
    await this.writeFile('tools.json', tools);
    return tools[index];
  }

  async deleteTool(id: string): Promise<boolean> {
    const tools = await this.readFile<Tool>('tools.json');
    const index = tools.findIndex(tool => tool.id === id);
    if (index === -1) return false;
    
    tools.splice(index, 1);
    await this.writeFile('tools.json', tools);
    return true;
  }

  async getApprovedTools(): Promise<Tool[]> {
    const tools = await this.readFile<Tool>('tools.json');
    return tools.filter(tool => tool.approved);
  }

  // Submission methods
  async getSubmissions(): Promise<Submission[]> {
    return this.readFile<Submission>('submissions.json');
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const submissions = await this.readFile<Submission>('submissions.json');
    return submissions.find(sub => sub.id === id);
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const submissions = await this.readFile<Submission>('submissions.json');
    const submission: Submission = {
      ...insertSubmission,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    submissions.push(submission);
    await this.writeFile('submissions.json', submissions);
    return submission;
  }

  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | undefined> {
    const submissions = await this.readFile<Submission>('submissions.json');
    const index = submissions.findIndex(sub => sub.id === id);
    if (index === -1) return undefined;
    
    submissions[index] = { ...submissions[index], ...updates };
    await this.writeFile('submissions.json', submissions);
    return submissions[index];
  }

  // Newsletter methods
  async subscribeNewsletter(email: string): Promise<Newsletter> {
    const newsletters = await this.readFile<Newsletter>('newsletter.json');
    const existing = newsletters.find(sub => sub.email === email);
    
    if (existing) {
      existing.active = true;
      await this.writeFile('newsletter.json', newsletters);
      return existing;
    }

    const subscription: Newsletter = {
      id: randomUUID(),
      email,
      subscribedAt: new Date().toISOString(),
      active: true,
    };
    newsletters.push(subscription);
    await this.writeFile('newsletter.json', newsletters);
    return subscription;
  }

  async unsubscribeNewsletter(email: string): Promise<boolean> {
    const newsletters = await this.readFile<Newsletter>('newsletter.json');
    const subscription = newsletters.find(sub => sub.email === email);
    if (!subscription) return false;
    
    subscription.active = false;
    await this.writeFile('newsletter.json', newsletters);
    return true;
  }

  async getNewsletterSubscriber(email: string): Promise<Newsletter | undefined> {
    const newsletters = await this.readFile<Newsletter>('newsletter.json');
    return newsletters.find(sub => sub.email === email && sub.active);
  }

  // OTP methods
  async createOTP(email: string, otp: string): Promise<OTP> {
    const otps = await this.readFile<OTP>('pending_otps.json');
    const existingIndex = otps.findIndex(o => o.email === email);
    
    const newOTP: OTP = {
      id: randomUUID(),
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      attempts: 0,
    };

    if (existingIndex !== -1) {
      otps[existingIndex] = newOTP;
    } else {
      otps.push(newOTP);
    }

    await this.writeFile('pending_otps.json', otps);
    return newOTP;
  }

  async getOTP(email: string): Promise<OTP | undefined> {
    const otps = await this.readFile<OTP>('pending_otps.json');
    const otp = otps.find(o => o.email === email);
    
    if (otp && new Date(otp.expiresAt) < new Date()) {
      await this.deleteOTP(email);
      return undefined;
    }
    
    return otp;
  }

  async deleteOTP(email: string): Promise<boolean> {
    const otps = await this.readFile<OTP>('pending_otps.json');
    const index = otps.findIndex(o => o.email === email);
    if (index === -1) return false;
    
    otps.splice(index, 1);
    await this.writeFile('pending_otps.json', otps);
    return true;
  }

  async incrementOTPAttempts(email: string): Promise<void> {
    const otps = await this.readFile<OTP>('pending_otps.json');
    const otp = otps.find(o => o.email === email);
    if (otp) {
      otp.attempts += 1;
      await this.writeFile('pending_otps.json', otps);
    }
  }
}

export const storage = new FileStorage();
