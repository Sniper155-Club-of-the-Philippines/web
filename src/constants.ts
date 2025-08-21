import coverImg from '@/assets/cover.jpg';

export const HOME_PANEL = {
    badge: '✨ YClub',
    heading: 'Sniper155 Club of the Philippines Inc.',
    description:
        'Ride with passion. Where Sniper155 enthusiasts unite to share their love for the ride, the community, and the journey ahead.',
    buttons: {
        primary: {
            text: 'Explore',
            url: '/gallery',
        },
    },
    cover: {
        src: coverImg.src,
        alt: 'S155CP Cover',
    },
} as const;
