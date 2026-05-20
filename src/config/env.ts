const normalizeEnv = (value: string | undefined): string =>
    typeof value === 'string' ? value.trim() : '';

export const ENV = {
    SUPABASE_URL: normalizeEnv(process.env.EXPO_PUBLIC_SUPABASE_URL),
    APPS_SCRIPT_URL: normalizeEnv(process.env.EXPO_PUBLIC_APPS_SCRIPT_URL),
    YOUFORM_URL: normalizeEnv(process.env.EXPO_PUBLIC_YOUFORM_URL),
};

export const isConfigured = (value: string) => value.length > 0;
