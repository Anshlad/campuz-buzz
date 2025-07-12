
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Plus, Users, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export const MobileBottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Plus, label: 'Create', path: '/create', isCreate: true },
    { icon: Users, label: 'Groups', path: '/communities' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                  item.isCreate
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg scale-110'
                    : isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`
              }
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <item.icon className={`h-5 w-5 ${item.isCreate ? 'h-6 w-6' : ''}`} />
                {item.path === '/communities' && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-4 w-4 p-0 flex items-center justify-center rounded-full"
                  >
                    2
                  </Badge>
                )}
              </motion.div>
              <span className="text-xs mt-1 font-medium truncate">{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
