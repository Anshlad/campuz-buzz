
import { useState, useEffect } from 'react';
import { validatePassword } from '@/utils/securityValidation';
import { useToast } from '@/hooks/use-toast';

interface PasswordSecurityOptions {
  checkBreaches?: boolean;
  minStrength?: number;
}

export const usePasswordSecurity = (options: PasswordSecurityOptions = {}) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  
  const { checkBreaches = true, minStrength = 80 } = options;

  const validatePasswordSecurity = async (password: string) => {
    setIsChecking(true);
    
    try {
      // Validate password strength
      const strengthResult = validatePassword(password);
      
      if (!strengthResult.success) {
        toast({
          title: "Weak Password",
          description: strengthResult.error?.issues?.[0]?.message || "Password doesn't meet security requirements",
          variant: "destructive"
        });
        return { isValid: false, issues: strengthResult.error?.issues };
      }

      // Check against common breached passwords (mock implementation)
      if (checkBreaches) {
        const isBreached = await checkPasswordBreach(password);
        if (isBreached) {
          toast({
            title: "Compromised Password",
            description: "This password has been found in data breaches. Please choose a different password.",
            variant: "destructive"
          });
          return { isValid: false, issues: [{ message: "Password found in breach database" }] };
        }
      }

      return { isValid: true, issues: [] };
    } catch (error) {
      console.error('Password security check failed:', error);
      return { isValid: false, issues: [{ message: "Security check failed" }] };
    } finally {
      setIsChecking(false);
    }
  };

  const checkPasswordBreach = async (password: string): Promise<boolean> => {
    // Mock implementation - in production, use HaveIBeenPwned API or similar
    // For security, we'd hash the password and check only the first 5 characters
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890', 'password1'
    ];
    
    return commonPasswords.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    );
  };

  const generateSecurePassword = (length: number = 16): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  return {
    validatePasswordSecurity,
    generateSecurePassword,
    isChecking
  };
};
