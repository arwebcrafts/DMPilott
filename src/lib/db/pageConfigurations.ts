import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface PageConfiguration {
  id: string;
  user_id: string;
  page_name: string;
  page_url: string;
  page_id: string;
  gift_link_url: string;
  gift_link_title?: string;
  gift_link_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePageConfigurationInput {
  user_id: string;
  page_name: string;
  page_url: string;
  page_id: string;
  gift_link_url: string;
  gift_link_title?: string;
  gift_link_description?: string;
  is_active?: boolean;
}

export interface UpdatePageConfigurationInput {
  page_name?: string;
  page_url?: string;
  page_id?: string;
  gift_link_url?: string;
  gift_link_title?: string;
  gift_link_description?: string;
  is_active?: boolean;
}

/**
 * Create a new page configuration
 */
export async function createPageConfiguration(
  input: CreatePageConfigurationInput
): Promise<PageConfiguration> {
  const { data, error } = await supabase
    .from('page_configurations')
    .insert({
      ...input,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create page configuration: ${error.message}`);
  }

  return data;
}

/**
 * Get page configuration by ID
 */
export async function getPageConfigurationById(
  id: string
): Promise<PageConfiguration | null> {
  const { data, error } = await supabase
    .from('page_configurations')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get page configuration: ${error.message}`);
  }

  return data;
}

/**
 * Get page configuration by user ID
 */
export async function getPageConfigurationByUserId(
  userId: string
): Promise<PageConfiguration | null> {
  const { data, error } = await supabase
    .from('page_configurations')
    .select()
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get page configuration: ${error.message}`);
  }

  return data;
}

/**
 * Get all page configurations for a user
 */
export async function getPageConfigurationsByUserId(
  userId: string
): Promise<PageConfiguration[]> {
  const { data, error } = await supabase
    .from('page_configurations')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get page configurations: ${error.message}`);
  }

  return data || [];
}

/**
 * Get the first active page configuration (for webhook use)
 */
export async function getPageConfiguration(): Promise<PageConfiguration | null> {
  const { data, error } = await supabase
    .from('page_configurations')
    .select()
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get page configuration: ${error.message}`);
  }

  return data;
}

/**
 * Update page configuration
 */
export async function updatePageConfiguration(
  id: string,
  input: UpdatePageConfigurationInput
): Promise<PageConfiguration> {
  const { data, error } = await supabase
    .from('page_configurations')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update page configuration: ${error.message}`);
  }

  return data;
}

/**
 * Delete page configuration
 */
export async function deletePageConfiguration(id: string): Promise<void> {
  const { error } = await supabase
    .from('page_configurations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete page configuration: ${error.message}`);
  }
}
