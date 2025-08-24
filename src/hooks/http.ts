import { accessAtom } from '@/atoms/auth';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import axios, { AxiosInstance } from 'axios';

let httpInstance: AxiosInstance | null = null;

function getHttpInstance() {
    if (!httpInstance) {
        httpInstance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            withCredentials: true,
            headers: {
                Accept: 'application/json',
            },
        });
    }
    return httpInstance;
}

export function useHttp() {
    const [access] = useAtom(accessAtom);

    const http = useMemo(() => getHttpInstance(), []);

    useEffect(() => {
        if (access) {
            http.defaults.headers.Authorization = `${access.type} ${access.token}`;
        } else {
            delete http.defaults.headers.Authorization;
        }
    }, [access, http]);

    return http;
}
