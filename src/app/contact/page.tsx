'use client';

import React from 'react';
import Container from '@/components/root/Container';
import Header from '@/components/root/Header';
import Footer from '@/components/root/Footer';
import ContactPanel from '@/components/root/panels/ContactPanel';
import { CONTACT_PANEL, SETTING_GROUP } from '@/constants';
import { useSettingQuery } from '@/hooks/queries';

const group = SETTING_GROUP.CONTACT_INFO;

export default function Contact() {
    const { data: settings } = useSettingQuery({ group });

    const record = {
        title: CONTACT_PANEL.title as string,
        description: CONTACT_PANEL.description as string,
        phone: CONTACT_PANEL.phone as string,
        email: CONTACT_PANEL.email as string,
    };

    if (settings) {
        for (const setting of settings) {
            if (setting.key === 'title' && setting.type === 'string') {
                record.title = setting.value;
            } else if (
                setting.key === 'description' &&
                setting.type === 'textarea'
            ) {
                record.description = setting.value;
            } else if (setting.key === 'phone' && setting.type === 'string') {
                record.phone = setting.value;
            } else if (setting.key === 'email' && setting.type === 'email') {
                record.email = setting.value;
            }
        }
    }

    return (
        <>
            <Header />
            <Container>
                <ContactPanel {...record} />
            </Container>
            <Footer />
        </>
    );
}
