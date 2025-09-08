/* eslint-disable @next/next/no-img-element */
'use client';

import { forwardRef } from 'react';
import national from '@/assets/national.png';
import yclub from '@/assets/yclub-blue.png';
import triangle from '@/assets/triangle.png';
import { Montserrat } from 'next/font/google';

const font = Montserrat({
    subsets: ['latin'],
});

export type Props = {
    src?: string | null;
    yclubNumber?: string | null;
    name: string;
    date: string;
};

const CardFront = forwardRef<HTMLDivElement, Props>(
    ({ src, name, date, yclubNumber }, ref) => {
        return (
            <div
                ref={ref}
                className={`w-96 h-56 bg-[#002261] rounded-xl relative flex transform-none ${font.className}`}
            >
                <div className='absolute h-56 rounded-xl z-40'>
                    <img
                        src={triangle.src}
                        className='w-60 object-cover h-56 rounded-xl'
                        alt='Triangle Background'
                    />
                    <div className='absolute top-6 left-0 px-4'>
                        <img
                            src={yclub.src}
                            className='w-20 object-cover h-12 rounded-xl'
                            alt='Logo'
                        />
                    </div>
                    {src && (
                        <div className='absolute top-20 left-0 px-4'>
                            <img
                                src={src}
                                className='w-20 object-cover h-20 rounded-lg'
                                alt='Profile Picture'
                            />
                        </div>
                    )}
                    <div className='absolute bottom-8 left-0 px-4 text-center'>
                        <h1 className='text-blue-950 text-[0.6rem]'>
                            {yclubNumber}
                        </h1>
                    </div>
                </div>
                <div>
                    <div className='flex absolute right-12 top-4'>
                        <div className='justify-center relative'>
                            <div className='absolute top-1 left-4 z-50 w-14 h-14 bg-blue-950 rounded-full flex items-center justify-center'>
                                <img
                                    src={national.src}
                                    className='w-12 object-contain z-50'
                                    alt='Logo'
                                />
                            </div>
                            <div className='overflow-hidden rounded-2xl xl:skew-x-[36deg] lg:skew-x-[36deg] z-40 absolute top-0 left-8 w-[130px]'>
                                <div className='h-14 bg-white z-40 xl:-skew-x-[36deg] lg:-skew-x-[36deg] scale-[20]'></div>
                                <div className='absolute z-40 xl:-skew-x-[36deg] lg:-skew-x-[36deg] left-11 top-0 flex justify-center w-20'>
                                    <div className='items-center flex'>
                                        <h1 className='text-[0.5rem] mt-4 font-extrabold text-btn-blue text-center text-blue-950'>
                                            SNIPER 155 CLUB OF THE PHILIPPINES
                                        </h1>
                                    </div>
                                </div>
                            </div>
                            <div className='w-36 h-[70px] overflow-hidden rounded-xl xl:skew-x-[36deg] lg:skew-x-[36deg]'>
                                <div className='absolute bottom-0 bg-gradient-to-t from-[#002F82] z-40 w-full h-full opacity-55'></div>
                                <img
                                    src={national.src}
                                    className='w-96 h-56 object-cover rounded-xl xl:-skew-x-[36deg] lg:-skew-x-[36deg] scale-[2.5]'
                                    alt='Background Image'
                                />
                            </div>
                        </div>
                    </div>
                    <div className='absolute right-0 top-24 px-4'>
                        <div className='w-36 h-[0.1rem] bg-white'></div>
                        <div className='flex justify-between mt-1'>
                            <div>
                                <h1 className='uppercase text-[0.4rem]'>
                                    motorcycle
                                </h1>
                                <p className='uppercase text-[0.4rem] font-bold'>
                                    Sniper 155
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='absolute right-0 bottom-4 w-full'>
                        <div className='w-full h-16 bg-gradient-to-l from-[#315A8D] relative'>
                            <div className='z-40 absolute right-0 px-4 top-1'>
                                <h1 className='text-white font-bold uppercase'>
                                    {name}
                                </h1>
                                <div className='mt-1'>
                                    <h1 className='text-[0.4rem]'>
                                        MEMBERSHIP DATE
                                    </h1>
                                    <p className='text-[0.7rem] font-bold'>
                                        {date}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

CardFront.displayName = 'CardFront';

export default CardFront;
