
import { z } from 'zod';

// Enhanced input validation schemas
export const userIdSchema = z.string().uuid('Invalid user ID format');
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const roleSchema = z.enum(['admin', 'moderator', 'faculty', 'student']);

// Enhanced security validation functions
export const validateAndSanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input provided');
  }
  
  // Remove potentially dangerous characters
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
    
  if (sanitized.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  return sanitized;
};

export const validateUserRole = (role: string): { success: boolean; role?: string; error?: string } => {
  try {
    const validatedRole = roleSchema.parse(role);
    return { success: true, role: validatedRole };
  } catch (error) {
    return { success: false, error: 'Invalid role provided' };
  }
};

export const isValidUUID = (uuid: string): boolean => {
  try {
    userIdSchema.parse(uuid);
    return true;
  } catch {
    return false;
  }
};

export const validateEmail = (email: string): { success: boolean; email?: string; error?: string } => {
  try {
    const validatedEmail = emailSchema.parse(email);
    return { success: true, email: validatedEmail };
  } catch (error) {
    return { success: false, error: 'Invalid email format' };
  }
};

export const validatePassword = (password: string): { success: boolean; errors: string[] } => {
  try {
    passwordSchema.parse(password);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map(e => e.message) };
    }
    return { success: false, errors: ['Invalid password'] };
  }
};

// Rate limiting utilities
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return {
    checkLimit: (identifier: string): boolean => {
      const now = Date.now();
      const record = attempts.get(identifier);
      
      if (!record) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (now > record.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (record.count >= maxAttempts) {
        return false;
      }
      
      record.count++;
      return true;
    },
    
    getRemainingAttempts: (identifier: string): number => {
      const record = attempts.get(identifier);
      if (!record || Date.now() > record.resetTime) {
        return maxAttempts;
      }
      return Math.max(0, maxAttempts - record.count);
    }
  };
};

// Security headers check
export const checkSecurityHeaders = (): { secure: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  let secure = true;
  
  // Check if running over HTTPS in production
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    warnings.push('Application should be served over HTTPS in production');
    secure = false;
  }
  
  // Check for secure context APIs
  if (!window.isSecureContext) {
    warnings.push('Application is not running in a secure context');
    secure = false;
  }
  
  return { secure, warnings };
};
