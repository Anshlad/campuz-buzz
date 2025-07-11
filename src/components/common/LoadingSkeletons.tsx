
import React from 'react';

export const PostSkeleton: React.FC = () => (
  <div className="bg-card rounded-lg p-6 shadow-sm animate-fade-in">
    <div className="flex items-start space-x-3 mb-4">
      <div className="skeleton w-12 h-12 rounded-full" />
      <div className="flex-1">
        <div className="skeleton h-4 w-32 mb-2" />
        <div className="skeleton h-3 w-24" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
    </div>
    <div className="skeleton h-48 w-full rounded-lg mb-4" />
    <div className="flex space-x-4">
      <div className="skeleton h-8 w-16" />
      <div className="skeleton h-8 w-16" />
      <div className="skeleton h-8 w-16" />
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="bg-card rounded-lg p-6 shadow-sm animate-fade-in">
    <div className="flex items-center space-x-4 mb-6">
      <div className="skeleton w-20 h-20 rounded-full" />
      <div className="flex-1">
        <div className="skeleton h-6 w-40 mb-2" />
        <div className="skeleton h-4 w-32 mb-2" />
        <div className="skeleton h-4 w-24" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="text-center">
        <div className="skeleton h-8 w-12 mx-auto mb-2" />
        <div className="skeleton h-4 w-16 mx-auto" />
      </div>
      <div className="text-center">
        <div className="skeleton h-8 w-12 mx-auto mb-2" />
        <div className="skeleton h-4 w-16 mx-auto" />
      </div>
      <div className="text-center">
        <div className="skeleton h-8 w-12 mx-auto mb-2" />
        <div className="skeleton h-4 w-16 mx-auto" />
      </div>
    </div>
    <div className="skeleton h-20 w-full" />
  </div>
);

export const ChatSkeleton: React.FC = () => (
  <div className="space-y-4 animate-fade-in">
    {[...Array(5)].map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
        <div className={`flex items-start space-x-2 max-w-xs ${i % 2 === 0 ? '' : 'flex-row-reverse space-x-reverse'}`}>
          <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
          <div className="skeleton h-10 w-32 rounded-2xl" />
        </div>
      </div>
    ))}
  </div>
);
