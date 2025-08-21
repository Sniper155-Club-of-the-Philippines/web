import type { User } from '@/types/user';
import type { Chapter } from '@/types/chapter';

export type UserFormInputs = Omit<
    User,
    'created_at' | 'updated_at' | 'google_id' | 'chapter'
> & { password?: string; password_confirmation?: string; photo?: File };

export type ChapterFormInputs = Omit<Chapter, 'created_at' | 'updated_at'> & {
    photo?: File;
};
