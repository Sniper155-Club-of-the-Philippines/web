'use client';

import HomePanel from '@/components/root/HomePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { HOME_PANEL } from '@/constants';
import { useForm } from 'react-hook-form';

type Inputs = {
    heading: string;
    description: string;
    photo?: File;
};

export default function LandingPage() {
    const { register, setValue, watch, reset } = useForm<Inputs>({
        defaultValues: {
            heading: HOME_PANEL.heading,
            description: HOME_PANEL.description,
        },
    });

    const photo = watch('photo');

    const preview = {
        heading: watch('heading'),
        description: watch('description'),
        cover: {
            src: photo ? URL.createObjectURL(photo) : HOME_PANEL.cover.src,
            alt: photo?.name,
        },
    };

    return (
        <Tabs defaultValue='config'>
            <TabsList>
                <TabsTrigger value='config'>Configuration</TabsTrigger>
                <TabsTrigger value='preview'>Preview</TabsTrigger>
            </TabsList>
            <TabsContent value='config'>
                <form className='flex flex-col max-w-sm md:max-w-md lg:max-w-lg gap-4 pt-10'>
                    <div className='grid w-full items-center gap-3'>
                        <Label htmlFor='heading'>Heading</Label>
                        <Input
                            {...register('heading')}
                            id='heading'
                            type='text'
                            placeholder='Heading'
                        />
                    </div>
                    <div className='grid w-full items-center gap-3'>
                        <Label htmlFor='description'>Description</Label>
                        <Textarea
                            {...register('description')}
                            id='description'
                            placeholder='description'
                        />
                    </div>
                    <div className='grid w-full items-center gap-3'>
                        <Label htmlFor='photo' className='text-right'>
                            Photo
                        </Label>
                        <div className='md:col-span-3'>
                            <Input
                                id='photo'
                                type='file'
                                accept='image/*'
                                name='photo'
                                onChange={(e) => {
                                    const file = e.target.files?.[0];

                                    if (file) {
                                        setValue('photo', file);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex justify-start gap-2 mt-6'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => reset()}
                        >
                            Reset
                        </Button>
                        <Button type='submit'>Save</Button>
                    </div>
                </form>
            </TabsContent>
            <TabsContent value='preview'>
                <div className='px-0 md:px-5'>
                    <HomePanel
                        heading={preview.heading}
                        description={preview.description}
                        cover={preview.cover}
                    />
                </div>
            </TabsContent>
        </Tabs>
    );
}
