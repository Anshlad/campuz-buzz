
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { AuthPages } from '@/components/auth/AuthPages';
import HomeFeed from '@/pages/HomeFeed';
import { Profile } from '@/pages/Profile';
import { Communities } from '@/pages/Communities';
import { EventCalendar } from '@/pages/EventCalendar';
import { Chat } from '@/pages/Chat';
import { Announcements } from '@/pages/Announcements';
import { Explore } from '@/pages/Explore';
import { StudyGroups } from '@/pages/StudyGroups';
import { Toaster } from '@/components/ui/toaster';
import { motion, AnimatePresence } from 'framer-motion';

export const AppLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="relative mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto"></div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading CampuzBuzz...</h2>
            <p className="text-muted-foreground">Connecting you to your campus community</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <AuthPages />;
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-6 pb-20 md:pb-6"
          >
            <Routes>
              <Route path="/" element={<HomeFeed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/events" element={<EventCalendar />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/study-groups" element={<StudyGroups />} />
            </Routes>
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>

      <Toaster />
    </div>
  );
};
