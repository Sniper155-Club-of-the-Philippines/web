'use client';

import Container from '@/components/root/Container';
import Header from '@/components/root/Header';
import Footer from '@/components/root/Footer';
import HomePanel from '@/components/root/panels/HomePanel';
import { HOME_PANEL, SETTING_GROUP } from '@/constants';
import { useSettingQuery } from '@/hooks/queries';

const group = SETTING_GROUP.LANDING_PAGE;

export default function Home() {
    const { data: settings } = useSettingQuery({ group });

    const record = {
        heading: HOME_PANEL.heading as string,
        description: HOME_PANEL.description as string,
        cover: {
            src: HOME_PANEL.cover.src as string,
            alt: HOME_PANEL.cover.alt as string,
        },
    };

    if (settings) {
        for (const setting of settings) {
            if (setting.key === 'heading' && setting.type === 'string') {
                record.heading = setting.value;
            } else if (
                setting.key === 'description' &&
                setting.type === 'textarea'
            ) {
                record.description = setting.value;
            } else if (setting.key === 'photo' && setting.type === 'image') {
                record.cover = {
                    src: setting.value,
                    alt: (setting.meta.name as string) ?? HOME_PANEL.cover.alt,
                };
            }
        }
    }

    return (
        <>
            <Header />
            <Container>
                <HomePanel {...record} />
            </Container>
            <Footer />
        </>
    );
}
