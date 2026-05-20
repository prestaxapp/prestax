const normalizeEnv = (value: string | undefined, defaultValue: string = ''): string =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : defaultValue;

export const ENV = {
    SUPABASE_URL: normalizeEnv(process.env.EXPO_PUBLIC_SUPABASE_URL, 'https://czehdflereoajjrlbpzj.supabase.co'),
    APPS_SCRIPT_URL: normalizeEnv(process.env.EXPO_PUBLIC_APPS_SCRIPT_URL, 'https://script.google.com/macros/s/AKfycbw_Oy6vQ_XaE_VVa5JlN_L0ayCx0zXzXwZsrb_W63k_dNTWwC366mXFh92KnCZGnd54Jw/exec'),
    YOUFORM_URL: normalizeEnv(process.env.EXPO_PUBLIC_YOUFORM_URL, 'https://app.youform.com/forms/vbyuoc6z'),
};

export const isConfigured = (value: string) => value.length > 0;
