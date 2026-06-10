import { createServiceClient } from '@/lib/supabase/server';

const supabase = createServiceClient();

export interface UserPageInteraction {
  id: string;
  page_configuration_id: string;
  messenger_psid: string;
  interaction_type: 'button_clicked' | 'page_visited' | 'gift_claimed';
  self_reported_followed: boolean;
  gift_claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInteractionInput {
  page_configuration_id: string;
  messenger_psid: string;
  interaction_type: 'button_clicked' | 'page_visited' | 'gift_claimed';
  self_reported_followed?: boolean;
}

export interface UpdateUserInteractionInput {
  interaction_type?: 'button_clicked' | 'page_visited' | 'gift_claimed';
  self_reported_followed?: boolean;
  gift_claimed_at?: string | null;
}

/**
 * Create a new user page interaction
 */
export async function createUserInteraction(
  input: CreateUserInteractionInput
): Promise<UserPageInteraction> {
  const { data, error } = await supabase
    .from('user_page_interactions')
    .insert({
      ...input,
      self_reported_followed: input.self_reported_followed ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user interaction: ${error.message}`);
  }

  return data;
}

/**
 * Get user interaction by PSID and page configuration ID
 */
export async function getUserInteraction(
  messengerPsid: string,
  pageConfigurationId: string
): Promise<UserPageInteraction | null> {
  const { data, error } = await supabase
    .from('user_page_interactions')
    .select()
    .eq('messenger_psid', messengerPsid)
    .eq('page_configuration_id', pageConfigurationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get user interaction: ${error.message}`);
  }

  return data;
}

/**
 * Get all interactions for a page configuration
 */
export async function getInteractionsByPageConfiguration(
  pageConfigurationId: string
): Promise<UserPageInteraction[]> {
  const { data, error } = await supabase
    .from('user_page_interactions')
    .select()
    .eq('page_configuration_id', pageConfigurationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get interactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all interactions for a PSID
 */
export async function getInteractionsByPsid(
  messengerPsid: string
): Promise<UserPageInteraction[]> {
  const { data, error } = await supabase
    .from('user_page_interactions')
    .select()
    .eq('messenger_psid', messengerPsid)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get interactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Update user interaction
 */
export async function updateUserInteraction(
  messengerPsid: string,
  pageConfigurationId: string,
  input: UpdateUserInteractionInput
): Promise<UserPageInteraction> {
  const { data, error } = await supabase
    .from('user_page_interactions')
    .update(input)
    .eq('messenger_psid', messengerPsid)
    .eq('page_configuration_id', pageConfigurationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user interaction: ${error.message}`);
  }

  return data;
}

/**
 * Get interaction statistics for a page configuration
 */
export async function getInteractionStats(
  pageConfigurationId: string
): Promise<{
  total_interactions: number;
  button_clicks: number;
  page_visits: number;
  gifts_claimed: number;
  self_reported_follows: number;
}> {
  const { data, error } = await supabase
    .from('user_page_interactions')
    .select('*')
    .eq('page_configuration_id', pageConfigurationId);

  if (error) {
    throw new Error(`Failed to get interaction stats: ${error.message}`);
  }

  const interactions = data || [];

  return {
    total_interactions: interactions.length,
    button_clicks: interactions.filter((i: UserPageInteraction) => i.interaction_type === 'button_clicked').length,
    page_visits: interactions.filter((i: UserPageInteraction) => i.interaction_type === 'page_visited').length,
    gifts_claimed: interactions.filter((i: UserPageInteraction) => i.interaction_type === 'gift_claimed').length,
    self_reported_follows: interactions.filter((i: UserPageInteraction) => i.self_reported_followed).length,
  };
}

/**
 * Check if a user has already claimed a gift for a page configuration
 */
export async function hasUserClaimedGift(
  messengerPsid: string,
  pageConfigurationId: string
): Promise<boolean> {
  const interaction = await getUserInteraction(messengerPsid, pageConfigurationId);
  return interaction?.gift_claimed_at !== null;
}
