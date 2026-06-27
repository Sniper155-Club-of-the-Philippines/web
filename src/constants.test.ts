import { describe, expect, it } from 'vitest';
import {
    BLOOD_TYPES,
    CONTACT_PANEL,
    FORM_FIELD_TYPES,
    HOME_PANEL,
    SETTING_GROUP,
    SETTING_TYPES,
    SOCIAL_LINKS,
} from './constants';

describe('constants', () => {
    it('exposes the setting groups and types', () => {
        expect(SETTING_GROUP).toEqual({
            LANDING_PAGE: 'landing-page',
            CONTACT_INFO: 'contact-info',
        });
        expect(SETTING_TYPES.IMAGE).toBe('image');
        expect(Object.values(SETTING_TYPES)).toContain('boolean');
    });

    it('exposes the form field types', () => {
        expect(FORM_FIELD_TYPES.MULTIPLE_CHOICE).toBe('multiple_choice');
        expect(Object.values(FORM_FIELD_TYPES)).toHaveLength(8);
    });

    it('exposes the blood types', () => {
        expect(BLOOD_TYPES.O_NEG).toBe('O-');
        expect(Object.values(BLOOD_TYPES)).toHaveLength(8);
    });

    it('resolves the cover asset via the next-style import', () => {
        expect(HOME_PANEL.cover.src).toBeTruthy();
        expect(HOME_PANEL.heading).toContain('Sniper155');
    });

    it('exposes contact details', () => {
        expect(CONTACT_PANEL.email).toContain('@');
        expect(CONTACT_PANEL.phone).toMatch(/^\d+$/);
    });

    it('lists social links with hrefs, labels and icons', () => {
        expect(SOCIAL_LINKS).toHaveLength(4);
        for (const link of SOCIAL_LINKS) {
            expect(link.href).toMatch(/^https?:\/\//);
            expect(link.label).toBeTruthy();
            expect(link.icon).toBeTruthy();
        }
    });
});
