
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PasswordSecurityOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  checkCommonPasswords?: boolean;
  checkLeaks?: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isSecure: boolean;
  hasLeaks?: boolean;
}

const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890'
];

const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export const usePasswordSecurity = (options: PasswordSecurityOptions = {}) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    checkCommonPasswords = true,
    checkLeaks = false
  } = options;

  const checkPasswordStrength = useCallback(async (password: string): Promise<PasswordStrength> => {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= minLength) {
      score += 20;
    } else {
      feedback.push(`Password must be at least ${minLength} characters long`);
    }

    // Character type checks
    if (requireUppercase && !/[A-Z]/.test(password)) {
      feedback.push('Include at least one uppercase letter');
    } else if (requireUppercase) {
      score += 15;
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      feedback.push('Include at least one lowercase letter');
    } else if (requireLowercase) {
      score += 15;
    }

    if (requireNumbers && !/[0-9]/.test(password)) {
      feedback.push('Include at least one number');
    } else if (requireNumbers) {
      score += 15;
    }

    if (requireSpecialChars && !SPECIAL_CHARS.test(password)) {
      feedback.push('Include at least one special character');
    } else if (requireSpecialChars) {
      score += 15;
    }

    // Additional strength checks
    if (password.length >= 12) {
      score += 10;
    }

    if (password.length >= 16) {
      score += 10;
    }

    // Common password check
    if (checkCommonPasswords && COMMON_PASSWORDS.includes(password.toLowerCase())) {
      feedback.push('Avoid common passwords');
      score = Math.max(0, score - 30);
    }

    // Pattern checks
    const hasRepeatingChars = /(.)\1{2,}/.test(password);
    if (hasRepeatingChars) {
      feedback.push('Avoid repeating characters');
      score = Math.max(0, score - 15);
    }

    const hasSequentialChars = /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);
    if (hasSequentialChars) {
      feedback.push('Avoid sequential characters');
      score = Math.max(0, score - 10);
    }

    let hasLeaks = false;

    // Password leak check (simplified - in production, use a proper API)
    if (checkLeaks) {
      setIsChecking(true);
      try {
        // In a real implementation, you'd use HaveIBeenPwned API or similar
        // For now, we'll simulate this check
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate leak detection for demo passwords
        if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
          hasLeaks = true;
          feedback.push('This password has been found in data breaches');
          score = Math.max(0, score - 40);
        }
      } catch (error) {
        console.warn('Password leak check failed:', error);
      } finally {
        setIsChecking(false);
      }
    }

    const isSecure = score >= 70 && feedback.length === 0;

    return {
      score: Math.min(100, score),
      feedback,
      isSecure,
      hasLeaks
    };
  }, [minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars, checkCommonPasswords, checkLeaks]);

  const generateSecurePassword = useCallback((length: number = 16): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let charset = '';
    let password = '';

    // Ensure at least one character from each required set
    if (requireUppercase) {
      charset += uppercase;
      password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    }
    
    if (requireLowercase) {
      charset += lowercase;
      password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    }
    
    if (requireNumbers) {
      charset += numbers;
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    if (requireSpecialChars) {
      charset += specialChars;
      password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    }

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }, [requireUppercase, requireLowercase, requireNumbers, requireSpecialChars]);

  return {
    checkPasswordStrength,
    generateSecurePassword,
    isChecking
  };
};
