import type { Model } from '@/types/models/model';
import type { Chapter } from '@/types/models/chapter';
import type { Event } from '@/types/models/event';
import type { Profile } from '@/types/models/profile';
import type { User } from '@/types/models/user';

export type ModelInput<T extends Model, K extends keyof T = never> = Omit<
    T,
    'id' | 'created_at' | 'updated_at' | K
>;

export type ChapterFormInputs = ModelInput<Chapter> & {
    photo?: File;
};

export type EventFormInputs = ModelInput<Event>;

export type ProfileFormInputs = ModelInput<
    Profile,
    'user' | 'shortened_url' | 'url'
>;

export type UserFormInputs = ModelInput<User, 'google_id' | 'chapter'> & {
    password?: string;
    password_confirmation?: string;
    photo?: File;
};
