
// TODO: TEMPORARY BYPASS - Remove this file when authentication is restored
export const MOCK_USER = {
  id: 'mock-user-id-12345',
  email: 'demo@campuzbuzz.com',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    display_name: 'Demo User'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const MOCK_SESSION = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() / 1000 + 3600, // 1 hour from now
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
