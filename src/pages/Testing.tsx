import React from 'react';
import { AuthTestRunner } from '@/components/testing/AuthTestRunner';
import { PostTestRunner } from '@/components/testing/PostTestRunner';
import { PostInteractionTestRunner } from '@/components/testing/PostInteractionTestRunner';
import { EventTestRunner } from '@/components/testing/EventTestRunner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Testing = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            CampuzBuzz Testing Suite
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive testing for authentication, posts, and community features
          </p>
        </div>
        
        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="posts">Post Creation</TabsTrigger>
            <TabsTrigger value="interactions">Post Interactions</TabsTrigger>
            <TabsTrigger value="events">Events & RSVPs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="auth" className="mt-6">
            <AuthTestRunner />
          </TabsContent>
          
          <TabsContent value="posts" className="mt-6">
            <PostTestRunner />
          </TabsContent>
          
          <TabsContent value="interactions" className="mt-6">
            <PostInteractionTestRunner />
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <EventTestRunner />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};