
import { supabase } from '@/integrations/supabase/client';
import { fileUploadService, FileUploadType } from './fileUploadService';

export interface StudySession {
  id: string;
  study_group_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  is_virtual: boolean;
  max_participants?: number;
  created_by: string;
  created_at: string;
  participant_count?: number;
  participants?: SessionParticipant[];
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'missed' | 'cancelled';
  joined_at: string;
  left_at?: string;
  profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface StudyMaterial {
  id: string;
  study_group_id: string;
  uploaded_by: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  tags: string[];
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  uploader?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface StudyGroupAnalytics {
  id: string;
  study_group_id: string;
  metric_type: string;
  metric_value: any;
  recorded_at: string;
  period_start?: string;
  period_end?: string;
}

class StudyGroupsService {
  // Session Management
  async createSession(sessionData: Omit<StudySession, 'id' | 'created_at' | 'participant_count'>) {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert(sessionData)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getGroupSessions(studyGroupId: string) {
    const { data, error } = await supabase
      .from('study_sessions')
      .select(`
        *,
        session_participants(count),
        session_participants(
          id,
          user_id,
          status,
          joined_at,
          profiles:user_id(display_name, avatar_url)
        )
      `)
      .eq('study_group_id', studyGroupId)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    return data?.map(session => ({
      ...session,
      participant_count: session.session_participants?.length || 0,
      participants: session.session_participants || []
    })) || [];
  }

  async joinSession(sessionId: string, userId: string) {
    const { data, error } = await supabase
      .from('session_participants')
      .insert({
        session_id: sessionId,
        user_id: userId,
        status: 'registered'
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async updateSessionStatus(sessionId: string, userId: string, status: SessionParticipant['status']) {
    const { data, error } = await supabase
      .from('session_participants')
      .update({ status })
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async leaveSession(sessionId: string, userId: string) {
    const { error } = await supabase
      .from('session_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Study Materials Management
  async uploadMaterial(
    studyGroupId: string,
    userId: string,
    file: File,
    materialData: {
      title: string;
      description?: string;
      tags?: string[];
      is_public?: boolean;
    }
  ) {
    // Upload file to Supabase Storage
    const uploadResult = await fileUploadService.uploadFile(file, 'attachment', userId);

    // Create material record
    const { data, error } = await supabase
      .from('study_materials')
      .insert({
        study_group_id: studyGroupId,
        uploaded_by: userId,
        title: materialData.title,
        description: materialData.description,
        file_url: uploadResult.url,
        file_type: uploadResult.fileType,
        file_size: uploadResult.fileSize,
        tags: materialData.tags || [],
        is_public: materialData.is_public ?? true
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getGroupMaterials(studyGroupId: string) {
    const { data, error } = await supabase
      .from('study_materials')
      .select(`
        *,
        profiles:uploaded_by(display_name, avatar_url)
      `)
      .eq('study_group_id', studyGroupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async deleteMaterial(materialId: string, userId: string) {
    // Get material details first to delete file
    const { data: material, error: fetchError } = await supabase
      .from('study_materials')
      .select('file_url, uploaded_by')
      .eq('id', materialId)
      .eq('uploaded_by', userId)
      .single();

    if (fetchError) throw fetchError;

    // Delete file from storage
    await fileUploadService.deleteFile(material.file_url, 'attachment');

    // Delete material record
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', materialId)
      .eq('uploaded_by', userId);

    if (error) throw error;
  }

  async incrementDownloadCount(materialId: string) {
    const { error } = await supabase.rpc('increment', {
      table_name: 'study_materials',
      row_id: materialId,
      column_name: 'download_count'
    });

    if (error) {
      // Fallback to manual increment
      const { data: material } = await supabase
        .from('study_materials')
        .select('download_count')
        .eq('id', materialId)
        .single();

      if (material) {
        await supabase
          .from('study_materials')
          .update({ download_count: material.download_count + 1 })
          .eq('id', materialId);
      }
    }
  }

  // Analytics
  async getGroupAnalytics(studyGroupId: string, metricType?: string) {
    let query = supabase
      .from('study_group_analytics')
      .select('*')
      .eq('study_group_id', studyGroupId)
      .order('recorded_at', { ascending: false });

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getGroupStats(studyGroupId: string) {
    // Get member count
    const { data: members, error: membersError } = await supabase
      .from('study_group_members')
      .select('id')
      .eq('study_group_id', studyGroupId);

    if (membersError) throw membersError;

    // Get session count
    const { data: sessions, error: sessionsError } = await supabase
      .from('study_sessions')
      .select('id')
      .eq('study_group_id', studyGroupId);

    if (sessionsError) throw sessionsError;

    // Get materials count
    const { data: materials, error: materialsError } = await supabase
      .from('study_materials')
      .select('id')
      .eq('study_group_id', studyGroupId);

    if (materialsError) throw materialsError;

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('study_group_analytics')
      .select('*')
      .eq('study_group_id', studyGroupId)
      .order('recorded_at', { ascending: false })
      .limit(10);

    if (activityError) throw activityError;

    return {
      memberCount: members?.length || 0,
      sessionCount: sessions?.length || 0,
      materialCount: materials?.length || 0,
      recentActivity: recentActivity || []
    };
  }

  // Chat Integration
  async createGroupChatRoom(studyGroupId: string, groupName: string, createdBy: string) {
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: `${groupName} - Study Group Chat`,
        description: `Chat room for ${groupName} study group`,
        type: 'study_group',
        created_by: createdBy,
        metadata: { study_group_id: studyGroupId }
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getGroupChatRoom(studyGroupId: string) {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('type', 'study_group')
      .contains('metadata', { study_group_id: studyGroupId })
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

export const studyGroupsService = new StudyGroupsService();
