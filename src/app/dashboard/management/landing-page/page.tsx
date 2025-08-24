'use client';

import SettingForm from '@/components/base/forms/SettingForm';
import HomePanel from '@/components/root/panels/HomePanel';
import { HOME_PANEL, SETTING_GROUP } from '@/constants';

export default function LandingPage() {
    const defaults = {
        heading: HOME_PANEL.heading,
        description: HOME_PANEL.description,
        photo: HOME_PANEL.cover.src as File | string,
    };

    return (
        <SettingForm
            group={SETTING_GROUP.LANDING_PAGE}
            defaults={defaults}
            fields={[
                {
                    key: 'heading',
                    label: 'Heading',
                    type: 'string',
                    placeholder: 'Heading',
                },
                {
                    key: 'description',
                    label: 'Description',
                    type: 'textarea',
                    placeholder: 'Description',
                },
                { key: 'photo', label: 'Photo', type: 'image' },
            ]}
            renderPreview={(values) => (
                <HomePanel
                    heading={values.heading}
                    description={values.description}
                    cover={{
                        src:
                            values.photo && values.photo instanceof File
                                ? URL.createObjectURL(values.photo)
                                : HOME_PANEL.cover.src,
                        alt:
                            values.photo instanceof File
                                ? values.photo?.name
                                : '',
                    }}
                    readonly
                />
            )}
        />
    );
}
