import { supabase } from './supabase';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export const logger = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: async (message: string, context?: any) => {
        logToSupabase('INFO', message, context);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn: async (message: string, context?: any) => {
        logToSupabase('WARN', message, context);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: async (message: string, context?: any) => {
        console.error(message, context); // Always log error to console too
        logToSupabase('ERROR', message, context);
    },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logToSupabase(level: LogLevel, message: string, context?: any) {
    try {
        await supabase.from('system_logs').insert({
            level,
            message,
            context: context ? JSON.parse(JSON.stringify(context)) : null
        });
    } catch (e) {
        // Fallback if logging fails
        console.error("Failed to log to Supabase:", e);
    }
}
