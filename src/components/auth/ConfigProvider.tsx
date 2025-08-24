'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { useCallback, useEffect, useRef } from 'react';
import { Config } from '@/types/models/auth';
import { useAtom } from 'jotai';
import { configAtom } from '@/atoms/auth';
import { useHttp } from '@/hooks/http';

export default function ConfigProvider({
    children,
}: {
    children?: React.ReactNode;
}) {
    const http = useHttp();
    const [config, setConfig] = useAtom(configAtom);
    const loading = useRef(false);

    const fetchConfig = useCallback(async () => {
        if (loading.current) {
            return;
        }
        loading.current = true;
        try {
            const config = await http.get<Config>('/v1/auth/config');
            setConfig(config.data);
        } catch (error) {
            console.error('Error fetching Google config:', error);
        } finally {
            loading.current = false;
        }
    }, [setConfig, http]);

    useEffect(() => {
        if (config) {
            return;
        }

        fetchConfig();
    }, [config, setConfig, fetchConfig]);

    if (!config?.google) {
        return null;
    }

    return (
        <GoogleOAuthProvider clientId={config.google.clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
