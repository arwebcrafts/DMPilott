import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface MetaAppCredentials {
  id: string;
  user_id: string;
  app_id: string;
  app_secret: string;
  page_access_token: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMetaCredentialsInput {
  user_id: string;
  app_id: string;
  app_secret: string;
  page_access_token: string;
}

export interface UpdateMetaCredentialsInput {
  app_id?: string;
  app_secret?: string;
  page_access_token?: string;
}

/**
 * Create new Meta app credentials
 */
export async function createMetaCredentials(
  input: CreateMetaCredentialsInput
): Promise<MetaAppCredentials> {
  const { data, error } = await supabase
    .from('meta_app_credentials')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create meta credentials: ${error.message}`);
  }

  return data;
}

/**
 * Get meta credentials by ID
 */
export async function getMetaCredentialsById(
  id: string
): Promise<MetaAppCredentials | null> {
  const { data, error } = await supabase
    .from('meta_app_credentials')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get meta credentials: ${error.message}`);
  }

  return data;
}

/**
 * Get meta credentials by user ID
 */
export async function getMetaCredentialsByUserId(
  userId: string
): Promise<MetaAppCredentials | null> {
  const { data, error } = await supabase
    .from('meta_app_credentials')
    .select()
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get meta credentials: ${error.message}`);
  }

  return data;
}

/**
 * Get meta credentials (for webhook use - gets first available)
 */
export async function getMetaAppCredentials(): Promise<MetaAppCredentials | null> {
  const { data, error } = await supabase
    .from('meta_app_credentials')
    .select()
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get meta credentials: ${error.message}`);
  }

  return data;
}

/**
 * Update meta credentials
 */
export async function updateMetaCredentials(
  id: string,
  input: UpdateMetaCredentialsInput
): Promise<MetaAppCredentials> {
  const { data, error } = await supabase
    .from('meta_app_credentials')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update meta credentials: ${error.message}`);
  }

  return data;
}

/**
 * Delete meta credentials
 */
export async function deleteMetaCredentials(id: string): Promise<void> {
  const { error } = await supabase
    .from('meta_app_credentials')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete meta credentials: ${error.message}`);
  }
}
