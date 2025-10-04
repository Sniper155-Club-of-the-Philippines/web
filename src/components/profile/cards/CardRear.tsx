import base from '@/assets/templates/base-3.png';
import { useQrCode } from '@/hooks/qr';
import { Profile } from '@/types/models/profile';
import Image from 'next/image';
import { forwardRef } from 'react';
import { Montserrat } from 'next/font/google';
import { padStart } from 'lodash-es';

const font = Montserrat({
    subsets: ['latin'],
});

type Props = {
    profile: Profile;
};

const CardRear = forwardRef<HTMLDivElement, Props>(({ profile }, ref) => {
    const { canvasRef } = useQrCode(profile.url, {
        height: 65,
        width: 65,
        appendLogo: false,
        dotsColor: '#131660',
    });

    return (
        <div
            ref={ref}
            className={`relative rounded-xl w-full max-w-96 ${font.className}`}
        >
            <div className='relative w-full aspect-[3456/2016] rounded-xl'>
                <Image
                    src={base.src}
                    alt='Base Rear ID'
                    fill
                    className='rounded-xl object-contain'
                />
                <div
                    ref={canvasRef}
                    id='rear-qr-canvas'
                    className='absolute bottom-[2.4%] right-[6%]'
                ></div>
                {profile.user?.chapter?.photo_url && (
                    <img
                        src={profile.user?.chapter?.photo_url}
                        alt='Chapter Logo'
                        className='w-18 h-18 z-10 absolute right-[6%] top-[5%]'
                    />
                )}
                <div className='z-10 absolute top-[40.7%] left-[3.9%] w-[123px] h-[44px] flex flex-col uppercase text-[0.65rem] leading-[9px] justify-around pl-[2px]'>
                    <div className='flex'>
                        <span className='font-bold'>CHAPTER:</span>
                        {profile.user?.chapter && (
                            <span className='ml-[2px]'>
                                {profile.user.chapter.name}
                            </span>
                        )}
                    </div>
                    <div className='flex'>
                        <span className='font-bold'>CLUB #:</span>
                        {profile.user?.club_number && (
                            <span className='ml-[2px]'>
                                {padStart(profile.user.club_number, 3, '0')}
                            </span>
                        )}
                    </div>
                    <div className='flex'>
                        <span className='font-bold'>BLOOD TYPE:</span>
                        {profile.user?.blood_type && (
                            <span className='ml-[2px]'>
                                {profile.user.blood_type}
                            </span>
                        )}
                    </div>
                    <div className='flex'>
                        <span className='font-bold'>ALLERGY:</span>
                        {profile.user?.allergy && (
                            <span className='ml-[2px]'>
                                {profile.user.allergy}
                            </span>
                        )}
                    </div>
                </div>
                <div className='z-10 absolute top-[40.7%] right-[3.9%] w-[123px] h-[44px] flex flex-col uppercase text-[0.65rem] leading-[9px] justify-between text-right pr-[2px]'>
                    <div className='flex flex-col'>
                        <span className='font-bold mt-1'>
                            EMERGENCY CONTACT DETAILS:
                        </span>
                        {profile.user?.emergency_contact_name && (
                            <span className='mt-[2px]'>
                                {profile.user.emergency_contact_name}
                            </span>
                        )}
                        {profile.user?.emergency_contact_phone && (
                            <span className=''>
                                {profile.user.emergency_contact_phone}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

CardRear.displayName = 'CardRear';

export default CardRear;
