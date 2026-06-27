import axios from 'axios';

export function apiError(error: unknown, fallback: string): string {
    if (!axios.isAxiosError(error)) return fallback;

    const data = error.response?.data as
        { message?: string; errors?: Record<string, string[]> } | undefined;
    const validation = data?.errors
        ? Object.values(data.errors).flat()[0]
        : undefined;

    return validation ?? data?.message ?? fallback;
}
