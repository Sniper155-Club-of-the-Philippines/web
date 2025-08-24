'use client';

import { setting } from '@/api';
import { loadingAtom } from '@/atoms/misc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { SETTING_TYPES } from '@/constants';
import { useHttp } from '@/hooks/http';
import { useSettingQuery } from '@/hooks/queries';
import { urlToFile } from '@/lib/utils';
import { SettingType } from '@/types/models/setting';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { DefaultValues, useForm } from 'react-hook-form';
import { toast } from 'sonner';

// A field definition
export type FieldConfig = {
    key: string;
    label: string;
    type: SettingType;
    placeholder?: string;
};

type Props<T extends Record<string, any>> = {
    group: string;
    defaults: DefaultValues<T>;
    fields: FieldConfig[];
    renderPreview: (values: T) => React.ReactNode;
};

export default function SettingForm<T extends Record<string, any>>({
    group,
    defaults,
    fields,
    renderPreview,
}: Props<T>) {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);

    const { register, setValue, watch, reset, handleSubmit } = useForm<T>({
        defaultValues: defaults,
    });

    const { data: settings } = useSettingQuery({ group });

    useEffect(() => {
        if (!settings) return;

        const values: Record<string, any> = { ...defaults };
        const promises: Promise<void>[] = [];

        for (const field of fields) {
            const s = settings.find(
                (x) => x.key === field.key && x.type === field.type
            );

            if (!s) continue;

            if (field.type === SETTING_TYPES.IMAGE && s.value) {
                promises.push(
                    urlToFile(s.value as string)
                        .then((file) => {
                            values[field.key] = file;
                        })
                        .catch((e) =>
                            console.error('Failed to convert photo URL:', e)
                        )
                );
            } else {
                values[field.key] = s.value;
            }
        }

        Promise.all(promises).then(() => reset(values as T));
    }, [settings, reset, fields, defaults]);

    const onSubmit = async (payload: T) => {
        setLoading(true);
        try {
            const requests: Promise<void>[] = [];

            for (const field of fields) {
                const value = payload[field.key];

                if (field.type === SETTING_TYPES.IMAGE) {
                    if (value) {
                        const file = value as File;
                        requests.push(
                            setting.store(http, {
                                group,
                                key: field.key,
                                value: file,
                                type: SETTING_TYPES.IMAGE,
                                meta: {
                                    name: file.name,
                                    lastModified: file.lastModified,
                                    type: file.type,
                                },
                            })
                        );
                    } else {
                        const id = settings?.find(
                            ({ key, type }) =>
                                key === field.key &&
                                type === SETTING_TYPES.IMAGE
                        )?.id;
                        if (id) requests.push(setting.remove(http, id));
                    }
                } else {
                    requests.push(
                        setting.store(http, {
                            group,
                            key: field.key,
                            value,
                            type: field.type,
                        })
                    );
                }
            }

            await Promise.all(requests);

            toast('Setting saved successfully.', { closeButton: true });
        } catch (error) {
            console.error(error);
            toast('Unable to save setting.', { closeButton: true });
        } finally {
            setLoading(false);
        }
    };

    const values = watch();

    return (
        <Tabs defaultValue='config'>
            <TabsList>
                <TabsTrigger value='config'>Configuration</TabsTrigger>
                <TabsTrigger value='preview'>Preview</TabsTrigger>
            </TabsList>

            <TabsContent value='config'>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='flex flex-col max-w-sm md:max-w-md lg:max-w-lg gap-4 pt-10'
                >
                    {fields.map((field) => (
                        <div
                            key={field.key}
                            className='grid w-full items-center gap-3'
                        >
                            <Label htmlFor={field.key}>{field.label}</Label>
                            {field.type === SETTING_TYPES.STRING && (
                                <Input
                                    {...register(field.key as any)}
                                    id={field.key}
                                    type='text'
                                    placeholder={field.placeholder}
                                />
                            )}
                            {field.type === SETTING_TYPES.EMAIL && (
                                <Input
                                    {...register(field.key as any)}
                                    id={field.key}
                                    type='email'
                                    placeholder={field.placeholder}
                                />
                            )}
                            {field.type === 'textarea' && (
                                <Textarea
                                    {...register(field.key as any)}
                                    id={field.key}
                                    placeholder={field.placeholder}
                                />
                            )}
                            {field.type === SETTING_TYPES.IMAGE && (
                                <Input
                                    id={field.key}
                                    type='file'
                                    accept='image/*'
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setValue(
                                                field.key as any,
                                                file as any,
                                                {
                                                    shouldDirty: true,
                                                }
                                            );
                                        }
                                    }}
                                />
                            )}
                        </div>
                    ))}

                    <div className='flex justify-start gap-2 mt-6'>
                        {settings && settings.length > 0 && (
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    reset();
                                }}
                            >
                                Undo
                            </Button>
                        )}
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => reset(defaults)}
                        >
                            Reset
                        </Button>
                        <Button type='submit'>Save</Button>
                    </div>
                </form>
            </TabsContent>

            <TabsContent value='preview'>
                <div className='px-0 md:px-5'>{renderPreview(values)}</div>
            </TabsContent>
        </Tabs>
    );
}
