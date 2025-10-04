import type { SETTING_TYPES } from '@/constants';
import { Setting } from '@/types/models/setting';

export type StorePayload =
    | (Omit<Partial<Setting>, 'value' | 'type'> & {
          type: typeof SETTING_TYPES.IMAGE;
          value: File;
      })
    | (Omit<Partial<Setting>, 'value' | 'type'> & {
          type: Exclude<Setting['type'], typeof SETTING_TYPES.IMAGE>;
          value?: Setting['value'];
      });
