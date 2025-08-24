'use client';

import Header from '@/components/root/Header';
import Container from '@/components/root/Container';
import Footer from '@/components/root/Footer';
import { useQuery } from '@tanstack/react-query';
import { event } from '@/api';
import { useHttp } from '@/hooks/http';
import EventPanel from '@/components/root/panels/EventPanel';

export default function Events() {
    const http = useHttp();
    const { data } = useQuery({
        queryKey: ['events'],
        queryFn: () => event.all(http),
    });

    return (
        <>
            <Header />
            <Container fluid>
                <EventPanel data={data ?? []} className='max-h-none' />
            </Container>
            <Footer />
        </>
    );
}
