// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Supabase Persistent Storage Client & Mode Guard
// =============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class ProductionStorageConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductionStorageConfigurationError';
  }
}

export interface StorageProviderInfo {
  provider: 'supabase' | 'local-file';
  isProduction: boolean;
  isConfigured: boolean;
  statusMessage: string;
}

let cachedSupabaseClient: SupabaseClient | null = null;

export function getStorageProviderInfo(): StorageProviderInfo {
  const isProduction = process.env.NODE_ENV === 'production';
  const mode = process.env.PERSISTENCE_MODE; // 'supabase' | 'local' | undefined
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const isConfigured = hasUrl && hasKey;

  if (mode === 'local') {
    return {
      provider: 'local-file',
      isProduction,
      isConfigured: false,
      statusMessage: 'Local file persistence forced via PERSISTENCE_MODE=local.',
    };
  }

  if (isProduction || mode === 'supabase') {
    if (!isConfigured) {
      return {
        provider: 'supabase',
        isProduction,
        isConfigured: false,
        statusMessage:
          'CRITICAL: Production mode requires Supabase credentials. Local file fallback is disallowed to prevent silent data loss.',
      };
    }
    return {
      provider: 'supabase',
      isProduction,
      isConfigured: true,
      statusMessage: 'Connected to shared Supabase PostgreSQL storage.',
    };
  }

  // Development / Test default: if credentials exist, use Supabase, else local file
  if (isConfigured) {
    return {
      provider: 'supabase',
      isProduction: false,
      isConfigured: true,
      statusMessage: 'Development mode connected to Supabase PostgreSQL.',
    };
  }

  return {
    provider: 'local-file',
    isProduction: false,
    isConfigured: false,
    statusMessage: 'Development mode running on isolated local JSON file engine (data/bruh-tesfa-db.json).',
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const info = getStorageProviderInfo();

  if (info.provider === 'local-file') {
    return null;
  }

  if (info.provider === 'supabase' && !info.isConfigured) {
    throw new ProductionStorageConfigurationError(
      'Database configuration error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured for shared persistent storage in production.'
    );
  }

  if (cachedSupabaseClient) {
    return cachedSupabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  cachedSupabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedSupabaseClient;
}
