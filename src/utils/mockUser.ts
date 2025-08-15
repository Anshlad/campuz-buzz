
// TODO: TEMPORARY BYPASS - Remove this file when authentication is restored
import { User, Session } from '@supabase/supabase-js';

export const MOCK_USER: User = {
  id: 'mock-user-id-12345',
  email: 'demo@campuzbuzz.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  phone: null,
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    display_name: 'Demo User'
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const MOCK_SESSION: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600, // 1 hour from now
  token_type: 'bearer',
  user: MOCK_USER
};

export const MOCK_PROFILE = {
  id: 'mock-profile-id',
  user_id: MOCK_USER.id,
  display_name: 'Demo User',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  bio: 'This is a demo user for CampuzBuzz',
  major: 'Computer Science',
  department: 'Engineering',
  year: 'Junior',
  role: 'student',
  school: 'Demo University',
  gpa: 3.8,
  graduation_year: 2025,
  skills: ['React', 'TypeScript', 'Node.js'],
  interests: ['Programming', 'Gaming', 'Music'],
  engagement_score: 150,
  social_links: {
    twitter: '@demouser',
    linkedin: 'demo-user',
    github: 'demouser'
  },
  privacy_settings: {
    email_visible: false,
    profile_visible: true,
    academic_info_visible: true,
    notifications: {
      posts: true,
      comments: true,
      mentions: true,
      messages: true,
      events: true
    }
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
