
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Palette, 
  Shield,
  Upload,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/common/FileUpload';
import { useOptimizedProfile } from '@/hooks/useOptimizedProfile';
import { useToast } from '@/hooks/use-toast';
import type { UploadResult } from '@/services/fileUploadService';

export default function Settings() {
  const { profile, updateProfile, loading } = useOptimizedProfile();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form states
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [major, setMajor] = useState(profile?.major || '');
  const [year, setYear] = useState(profile?.year || '');
  const [school, setSchool] = useState(profile?.school || '');
  const [gpa, setGpa] = useState(profile?.gpa?.toString() || '');
  const [graduationYear, setGraduationYear] = useState(profile?.graduation_year?.toString() || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [socialLinks, setSocialLinks] = useState(profile?.social_links || {});
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState(profile?.privacy_settings || {
    email_visible: false,
    profile_visible: true,
    academic_info_visible: true,
    notifications: {
      posts: true,
      comments: true,
      mentions: true,
      messages: true,
      events: true,
    }
  });

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        display_name: displayName,
        bio,
        major,
        year,
        school,
        gpa: gpa ? parseFloat(gpa) : undefined,
        graduation_year: graduationYear ? parseInt(graduationYear) : undefined,
        skills,
        interests,
        social_links: socialLinks,
        avatar_url: avatarUrl,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setIsSaving(true);
      await updateProfile({ privacy_settings: privacySettings });
      
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved."
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update privacy settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleAvatarUpload = (result: UploadResult) => {
    setAvatarUrl(result.url);
    toast({
      title: "Avatar uploaded",
      description: "Your new profile picture has been uploaded."
    });
  };

  const updateSocialLink = (platform: string, url: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: url
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <EnhancedCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                
                {/* Avatar Upload */}
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl">
                      {displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium mb-2">Profile Picture</h3>
                    <FileUpload
                      type="avatar"
                      accept="image/*"
                      onUploadComplete={handleAvatarUpload}
                      className="inline-block"
                    >
                      <EnhancedButton variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Avatar
                      </EnhancedButton>
                    </FileUpload>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="school">School</Label>
                    <Input
                      id="school"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="University name"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Academic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Your major"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Freshman">Freshman</SelectItem>
                        <SelectItem value="Sophomore">Sophomore</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gpa">GPA (Optional)</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      placeholder="3.75"
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2025"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <Label>Skills</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <EnhancedButton onClick={addSkill} disabled={!newSkill.trim()}>
                      Add
                    </EnhancedButton>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="mb-6">
                  <Label>Interests</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    />
                    <EnhancedButton onClick={addInterest} disabled={!newInterest.trim()}>
                      Add
                    </EnhancedButton>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {interests.map((interest) => (
                      <Badge key={interest} variant="outline" className="flex items-center gap-1">
                        {interest}
                        <button onClick={() => removeInterest(interest)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="mb-6">
                  <Label>Social Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {['linkedin', 'twitter', 'github', 'instagram'].map((platform) => (
                      <div key={platform}>
                        <Label htmlFor={platform} className="capitalize">{platform}</Label>
                        <Input
                          id={platform}
                          value={socialLinks[platform] || ''}
                          onChange={(e) => updateSocialLink(platform, e.target.value)}
                          placeholder={`Your ${platform} URL`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <EnhancedButton onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </EnhancedButton>
              </div>
            </EnhancedCard>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <EnhancedCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Profile Visibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to other users
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.profile_visible}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, profile_visible: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Visibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Show your email address on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.email_visible}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, email_visible: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Academic Info Visibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Show your academic information (GPA, major, etc.)
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.academic_info_visible}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, academic_info_visible: checked }))
                      }
                    />
                  </div>
                </div>

                <EnhancedButton onClick={handleSavePrivacy} disabled={isSaving} className="mt-6">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Privacy Settings'}
                </EnhancedButton>
              </div>
            </EnhancedCard>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <EnhancedCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                
                <div className="space-y-6">
                  {[
                    { key: 'posts', label: 'New Posts', description: 'Get notified about new posts in your communities' },
                    { key: 'comments', label: 'Comments', description: 'Get notified when someone comments on your posts' },
                    { key: 'mentions', label: 'Mentions', description: 'Get notified when someone mentions you' },
                    { key: 'messages', label: 'Direct Messages', description: 'Get notified about new direct messages' },
                    { key: 'events', label: 'Events', description: 'Get notified about upcoming events' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{label}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                      <Switch
                        checked={privacySettings.notifications?.[key as keyof typeof privacySettings.notifications]}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, [key]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <EnhancedButton onClick={handleSavePrivacy} disabled={isSaving} className="mt-6">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Notification Settings'}
                </EnhancedButton>
              </div>
            </EnhancedCard>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <EnhancedCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
                <div className="text-muted-foreground">
                  Theme and appearance settings coming soon...
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
