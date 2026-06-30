import { supabase, hasSupabaseConfig } from '../lib/supabase.js';

function generateCode(userId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefix = userId.slice(0, 4).toUpperCase().replace(/-/g, 'X');
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return prefix + suffix;
}

export async function getReferralCode(userId) {
  if (!userId) return null;
  
  // Deterministic fallback code based on userId
  const fallbackCode = generateCode(userId);

  if (!hasSupabaseConfig) return fallbackCode;

  try {
    const { data: existing, error: selectError } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId);
      
    if (existing && existing.length > 0) {
      return existing[0].code;
    }
    
    // Attempt to save the new code in the database
    const { data, error } = await supabase
      .from('referral_codes')
      .insert({ user_id: userId, code: fallbackCode })
      .select('code');
      
    if (data && data.length > 0) {
      return data[0].code;
    }
  } catch (err) {
    console.error('Error in getReferralCode:', err);
  }

  // Fallback so the user always has a functional link instantly
  return fallbackCode;
}

export function getReferralUrl(code) {
  return `${window.location.origin}/ref/${code}`;
}

export function applyReferralFromURL() {
  const path = window.location.pathname;
  const match = path.match(/^\/ref\/([A-Z0-9]{8})$/i);
  if (match) {
    localStorage.setItem('pending_referral', match[1].toUpperCase());
    return match[1].toUpperCase();
  }
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    localStorage.setItem('pending_referral', ref.toUpperCase());
    return ref.toUpperCase();
  }
  return null;
}

export async function getAvailableCredit(userId) {
  if (!hasSupabaseConfig) return 0;
  const { data } = await supabase
    .from('referral_credits')
    .select('credit_percent')
    .eq('user_id', userId)
    .eq('used', false);
  if (!data || data.length === 0) return 0;
  return data.reduce((sum, r) => sum + r.credit_percent, 0);
}

export async function getReferralStats(userId) {
  if (!hasSupabaseConfig) return { total: 0, converted: 0, credit: 0, history: [] };
  const [{ data: uses }, credit] = await Promise.all([
    supabase
      .from('referral_uses')
      .select('id, status, created_at, discount_given')
      .eq('referrer_user_id', userId)
      .order('created_at', { ascending: false }),
    getAvailableCredit(userId),
  ]);
  const history = uses ?? [];
  return {
    total: history.length,
    converted: history.filter((r) => r.status === 'converted').length,
    credit,
    history,
  };
}
