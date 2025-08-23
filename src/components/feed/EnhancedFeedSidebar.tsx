
import React from 'react';
import { ContentSuggestions } from '@/components/ai/ContentSuggestions';
import { AchievementsDisplay } from '@/components/achievements/AchievementsDisplay';
import { TrendingTopics } from '@/components/feed/TrendingTopics';

export const EnhancedFeedSidebar: React.FC = () => {
  return (
    <div className="space-y-6">
      <ContentSuggestions />
      <AchievementsDisplay />
      <TrendingTopics />
    </div>
  );
};
