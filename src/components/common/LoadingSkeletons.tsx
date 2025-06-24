
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const PostSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full rounded-lg mt-4" />
          <div className="flex items-center space-x-4 mt-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ProfileSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex space-x-2 mt-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-18" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const EventSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center space-x-2 mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const StudyGroupSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex space-x-2 mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ChatSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex space-x-2 ${i % 2 === 0 ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-48 rounded-2xl" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const FeedSkeletons = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
);
