export const AUTH_CONFIG = {
  autoRefreshToken: true,
  persistSession: false, // Server-side: don't persist session
  detectSessionInUrl: false,
};

export const AUTH_CONFIG_WITHOUT_REFRESH = {
  autoRefreshToken: false,
  persistSession: false,
  detectSessionInUrl: false,
};
