
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  className = ""
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default action: scroll to top and focus on post creator
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Try to focus the post creator
      setTimeout(() => {
        const postCreator = document.querySelector('[data-post-creator]') as HTMLElement;
        if (postCreator) {
          postCreator.click();
        }
      }, 500);
    }
  };

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-30 md:hidden"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Button
        onClick={handleClick}
        className={`h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
        size="icon"
      >
        {icon}
      </Button>
    </motion.div>
  );
};
