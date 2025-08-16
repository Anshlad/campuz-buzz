
import React, { useState } from 'react';
import { StudyGroupManager } from '@/components/study-groups/StudyGroupManager';
import { SessionScheduler } from '@/components/study-groups/SessionScheduler';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

const StudyGroups = () => {
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const handleScheduleSession = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowScheduler(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <p className="text-muted-foreground">
            Join study groups and schedule collaborative learning sessions
          </p>
        </div>
      </div>

      <StudyGroupManager onScheduleSession={handleScheduleSession} />

      <SessionScheduler
        open={showScheduler}
        onClose={() => setShowScheduler(false)}
        studyGroupId={selectedGroupId}
        onSessionCreated={() => {
          setShowScheduler(false);
          // Refresh would be handled by the StudyGroupManager
        }}
      />
    </div>
  );
};

export default StudyGroups;
