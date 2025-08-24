// types/models/setting.ts
import { SETTING_TYPES } from '@/constants';
import type { Model } from '@/types/models/model';

export type SettingType = (typeof SETTING_TYPES)[keyof typeof SETTING_TYPES];

export type SettingValueMap = {
    [SETTING_TYPES.STRING]: string;
    [SETTING_TYPES.EMAIL]: string;
    [SETTING_TYPES.TEXTAREA]: string;
    [SETTING_TYPES.IMAGE]: string;
    [SETTING_TYPES.JSON]: Record<string, unknown> | unknown[];
    [SETTING_TYPES.NUMBER]: number;
    [SETTING_TYPES.BOOLEAN]: boolean;
};

export interface BaseSetting<T extends SettingType> extends Model {
    group: string;
    key: string;
    value: T extends keyof SettingValueMap ? SettingValueMap[T] : unknown;
    type: T;
    meta: Record<string, unknown>;
}

export type Setting =
    | BaseSetting<typeof SETTING_TYPES.STRING>
    | BaseSetting<typeof SETTING_TYPES.EMAIL>
    | BaseSetting<typeof SETTING_TYPES.TEXTAREA>
    | BaseSetting<typeof SETTING_TYPES.IMAGE>
    | BaseSetting<typeof SETTING_TYPES.JSON>
    | BaseSetting<typeof SETTING_TYPES.NUMBER>
    | BaseSetting<typeof SETTING_TYPES.BOOLEAN>;
