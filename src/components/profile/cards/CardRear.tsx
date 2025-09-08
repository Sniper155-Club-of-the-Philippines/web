import base from '@/assets/templates/base.png';
import { useQrCode } from '@/hooks/qr';
import { Profile } from '@/types/models/profile';
import Image from 'next/image';
import { forwardRef } from 'react';

type Props = {
    profile: Profile;
};

const CardRear = forwardRef<HTMLDivElement, Props>(({ profile }, ref) => {
    const { canvasRef } = useQrCode(profile, {
        height: 65,
        width: 65,
        appendLogo: false,
    });

    return (
        <div ref={ref} className='relative rounded-xl w-full max-w-96'>
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
                {profile.user?.chapter && (
                    <span className='z-10 absolute text-[0.65rem] top-[39.5%] left-[20%]'>
                        {profile.user?.chapter?.name}
                    </span>
                )}
                {profile.user?.club_number && (
                    <span className='z-10 absolute text-[0.65rem] top-[44%] left-[17%]'>
                        {profile.user.club_number}
                    </span>
                )}
            </div>
        </div>
    );
});

CardRear.displayName = 'CardRear';

export default CardRear;
