
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Plus, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const MobileBottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Plus, label: 'Create', path: '/create', isCreate: true },
    { icon: Users, label: 'Groups', path: '/communities' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="mobile-nav md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              item.isCreate
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <item.icon className={`h-5 w-5 ${item.isCreate ? 'h-6 w-6' : ''}`} />
          <span className="text-xs mt-1 font-medium">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};
