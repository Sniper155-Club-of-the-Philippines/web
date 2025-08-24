'use client';

import SettingForm from '@/components/base/forms/SettingForm';
import ContactPanel from '@/components/root/panels/ContactPanel';
import { CONTACT_PANEL, SETTING_GROUP } from '@/constants';

export default function ContactInfo() {
    const defaults = {
        title: CONTACT_PANEL.title,
        description: CONTACT_PANEL.description,
        phone: CONTACT_PANEL.phone,
        email: CONTACT_PANEL.email,
    };

    return (
        <SettingForm
            group={SETTING_GROUP.CONTACT_INFO}
            defaults={defaults}
            fields={[
                {
                    key: 'title',
                    label: 'Title',
                    type: 'string',
                    placeholder: 'Title',
                },
                {
                    key: 'description',
                    label: 'Description',
                    type: 'textarea',
                    placeholder: 'Description',
                },
                {
                    key: 'phone',
                    label: 'Phone',
                    type: 'string',
                    placeholder: 'Phone',
                },
                {
                    key: 'email',
                    label: 'Email',
                    type: 'email',
                    placeholder: 'Email',
                },
            ]}
            renderPreview={(values) => <ContactPanel {...values} readonly />}
        />
    );
}
