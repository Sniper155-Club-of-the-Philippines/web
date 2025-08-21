import { accessAtom } from '@/atoms/auth';
import { useAtom } from 'jotai';

import { Http } from '@avidian/http';
import { useCallback, useEffect, useState } from 'react';

export function useHttp() {
    const [access] = useAtom(accessAtom);

    const makeInstance = useCallback(
        () =>
            new Http({
                baseUrl: process.env.NEXT_PUBLIC_API_URL,
                headers: {
                    Accept: 'application/json',
                    ...(access
                        ? {
                              Authorization: `${access.type} ${access.token}`,
                          }
                        : {}),
                },
            }),
        [access]
    );

    const [http, setHttp] = useState(() => makeInstance());

    useEffect(() => {
        setHttp(makeInstance());
    }, [makeInstance]);

    return http;
}
