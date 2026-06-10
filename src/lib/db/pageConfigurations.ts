import { createServiceClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

const supabase = createServiceClient();

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

export interface InstagramGiftOffer {
  id: string;
  user_id: string;
  account_username: string;
  gift_link_url: string;
  gift_link_title?: string;
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
  input: CreatePageConfigurationInput,
  client?: SupabaseClient
): Promise<PageConfiguration> {
  const db = client || supabase;
  const { data, error } = await db
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

/**
 * Get Instagram gift offer by account username
 */
export async function getInstagramGiftOffer(accountUsername: string): Promise<InstagramGiftOffer | null> {
  const { data, error } = await supabase
    .from('instagram_gift_offers')
    .select()
    .eq('account_username', accountUsername)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get Instagram gift offer: ${error.message}`);
  }

  return data;
}

/**
 * Get Instagram user interaction
 */
export async function getInstagramUserInteraction(psid: string, giftOfferId: string) {
  const { data, error } = await supabase
    .from('instagram_user_interactions')
    .select()
    .eq('instagram_psid', psid)
    .eq('instagram_gift_offer_id', giftOfferId)
    .maybeSingle();

  if (error) {
    console.error('[Instagram User Interaction] Failed to fetch interaction:', error);
    return null;
  }

  return data;
}

/**
 * Create Instagram user interaction
 */
export async function createInstagramUserInteraction(input: {
  instagram_gift_offer_id: string;
  instagram_psid: string;
  interaction_type?: string;
  self_reported_followed?: boolean;
}) {
  const { data, error } = await supabase
    .from('instagram_user_interactions')
    .insert({
      instagram_gift_offer_id: input.instagram_gift_offer_id,
      instagram_psid: input.instagram_psid,
      interaction_type: input.interaction_type || 'message_received',
      self_reported_followed: input.self_reported_followed || false,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('[Instagram User Interaction] Failed to create interaction:', error);
    return null;
  }

  return data;
}

/**
 * Update Instagram user interaction
 */
export async function updateInstagramUserInteraction(psid: string, giftOfferId: string, updates: {
  interaction_type?: string;
  self_reported_followed?: boolean;
  gift_claimed_at?: string;
}) {
  const { data, error } = await supabase
    .from('instagram_user_interactions')
    .update(updates)
    .eq('instagram_psid', psid)
    .eq('instagram_gift_offer_id', giftOfferId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[Instagram User Interaction] Failed to update interaction:', error);
    return null;
  }

  return data;
}
