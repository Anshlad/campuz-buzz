
import { z } from 'zod';

// Enhanced password validation with breach checking
export const EnhancedPasswordSchema = z.string()
  .min(12, "Password must be at least 12 characters long")
  .max(128, "Password cannot exceed 128 characters")
  .refine((password) => /[a-z]/.test(password), "Password must contain at least one lowercase letter")
  .refine((password) => /[A-Z]/.test(password), "Password must contain at least one uppercase letter")
  .refine((password) => /[0-9]/.test(password), "Password must contain at least one number")
  .refine((password) => /[^A-Za-z0-9]/.test(password), "Password must contain at least one special character")
  .refine((password) => !/(.)\1{2,}/g.test(password), "Password cannot contain repeated characters")
  .refine((password) => {
    // Check against common compromised passwords
    const commonPasswords = [
      'password123', '123456789', 'qwerty123', 'password1',
      'letmein123', 'welcome123', 'admin123', 'user123',
      'test123456', 'changeme123'
    ];
    return !commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()));
  }, "Password appears to be compromised. Please choose a different password.");

// Enhanced content validation with XSS and injection protection
export const SecureContentSchema = z.string()
  .max(50000, "Content exceeds maximum length")
  .refine((content) => {
    // Advanced XSS protection
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript\s*:/gi,
      /vbscript\s*:/gi,
      /data\s*:\s*text\/html/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*stylesheet/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /expression\s*\(/gi,
      /url\s*\(\s*javascript/gi,
      /behavior\s*:/gi
    ];
    
    return !xssPatterns.some(pattern => pattern.test(content));
  }, "Content contains potentially unsafe elements")
  .refine((content) => {
    // SQL injection protection
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+\b)/gi,
      /('|\"|;|--|\*|\/\*|\*\/)/g
    ];
    
    const suspiciousMatches = sqlPatterns.reduce((count, pattern) => {
      const matches = content.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Allow some SQL-like content but flag if too many patterns
    return suspiciousMatches < 3;
  }, "Content contains potentially unsafe SQL patterns");

// Enhanced file validation with MIME type checking
export const SecureFileUploadSchema = z.object({
  name: z.string()
    .max(255, "Filename too long")
    .refine((name) => !/[<>:"/\\|?*\x00-\x1f]/.test(name), "Filename contains invalid characters")
    .refine((name) => {
      // More comprehensive dangerous extensions
      const dangerousExtensions = [
        '.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar', 
        '.js', '.vbs', '.ps1', '.sh', '.php', '.asp', '.jsp',
        '.msi', '.dmg', '.app', '.deb', '.rpm', '.apk'
      ];
      return !dangerousExtensions.some(ext => name.toLowerCase().endsWith(ext));
    }, "File type not allowed for security reasons"),
  size: z.number()
    .max(50 * 1024 * 1024, "File size cannot exceed 50MB")
    .min(1, "File cannot be empty"),
  type: z.string()
    .refine((type) => {
      const allowedTypes = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Documents
        'application/pdf', 'text/plain', 'text/csv',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Archives (with caution)
        'application/zip', 'application/x-rar-compressed'
      ];
      return allowedTypes.includes(type);
    }, "File MIME type not supported")
    .refine((type) => {
      // Additional MIME type validation
      const suspiciousMimeTypes = [
        'application/x-executable',
        'application/x-msdownload',
        'application/x-msdos-program'
      ];
      return !suspiciousMimeTypes.includes(type);
    }, "File type flagged as potentially dangerous")
});

// Enhanced URL validation with domain whitelist support
export const SecureURLSchema = z.string()
  .url("Invalid URL format")
  .max(2048, "URL too long")
  .refine((url) => {
    // Protocol validation
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    try {
      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }, "URL uses unsafe or unsupported protocol")
  .refine((url) => {
    // Block suspicious URL patterns
    const suspiciousPatterns = [
      /[<>"'`]/,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /about:/i,
      /file:/i
    ];
    return !suspiciousPatterns.some(pattern => pattern.test(url));
  }, "URL contains potentially dangerous elements")
  .refine((url) => {
    // Domain validation for external links
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Block known malicious patterns
      const suspiciousDomains = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '10.',
        '192.168.',
        '172.'
      ];
      
      // Allow localhost in development
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      
      return !suspiciousDomains.some(domain => hostname.startsWith(domain));
    } catch {
      return false;
    }
  }, "URL points to restricted or private network");

// Rate limiting validation
export const RateLimitSchema = z.object({
  action: z.string(),
  userId: z.string().uuid(),
  timestamp: z.date(),
  ipAddress: z.string().ip().optional()
});

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000); // Limit length
};

// SQL injection prevention
export const sanitizeForDatabase = (input: string): string => {
  return input
    .replace(/['";]/g, '') // Remove quote characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*|\*\//g, '') // Remove block comments
    .trim();
};

// Advanced security headers validation
export const SecurityHeadersSchema = z.object({
  'Content-Security-Policy': z.string().optional(),
  'X-Frame-Options': z.enum(['DENY', 'SAMEORIGIN']).optional(),
  'X-Content-Type-Options': z.literal('nosniff').optional(),
  'Referrer-Policy': z.enum(['strict-origin-when-cross-origin', 'no-referrer']).optional(),
  'Permissions-Policy': z.string().optional()
});

// Audit log entry validation
export const AuditLogSchema = z.object({
  userId: z.string().uuid(),
  action: z.string().max(100),
  resource: z.string().max(100),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
  timestamp: z.date().default(() => new Date())
});

// Export validation functions
export const validateEnhancedPassword = (password: string) => {
  return EnhancedPasswordSchema.safeParse(password);
};

export const validateSecureContent = (content: string) => {
  return SecureContentSchema.safeParse(content);
};

export const validateSecureFileUpload = (file: { name: string; size: number; type: string }) => {
  return SecureFileUploadSchema.safeParse(file);
};

export const validateSecureURL = (url: string) => {
  return SecureURLSchema.safeParse(url);
};

export const validateRateLimit = (data: any) => {
  return RateLimitSchema.safeParse(data);
};

export const validateAuditLog = (data: any) => {
  return AuditLogSchema.safeParse(data);
};
