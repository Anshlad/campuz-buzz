
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AuthPages } from '@/components/auth/AuthPages';
import { HomeFeed } from '@/pages/HomeFeed';
import { Profile } from '@/pages/Profile';
import { EventCalendar } from '@/pages/EventCalendar';
import { Chat } from '@/pages/Chat';
import { Announcements } from '@/pages/Announcements';
import { Explore } from '@/pages/Explore';
import { StudyGroups } from '@/pages/StudyGroups';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export const AppLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CampuzBuzz...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPages />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<HomeFeed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/events" element={<EventCalendar />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/study-groups" element={<StudyGroups />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
