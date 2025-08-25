import coverImg from '@/assets/cover.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';

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

export const CONTACT_PANEL = {
    title: 'Contact Us',
    description:
        'We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!',
    phone: '09393847512',
    email: 'contactus@sniper155clubofthephilippines.com',
} as const;

export const SETTING_GROUP = {
    LANDING_PAGE: 'landing-page',
    CONTACT_INFO: 'contact-info',
} as const;

export const SETTING_TYPES = {
    STRING: 'string',
    EMAIL: 'email',
    TEXTAREA: 'textarea',
    IMAGE: 'image',
    JSON: 'json',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
} as const;

export const SOCIAL_LINKS = [
    {
        icon: (
            <FontAwesomeIcon icon={faFacebook} className='size-4 md:size-5' />
        ),
        href: 'https://www.facebook.com/profile.php?id=61569977818058',
        label: 'S155CP Official Page',
    },
    {
        icon: (
            <FontAwesomeIcon icon={faFacebook} className='size-4 md:size-5' />
        ),
        href: 'https://www.facebook.com/groups/824433192468479',
        label: 'S155CP Visitor Group',
    },
    {
        icon: (
            <FontAwesomeIcon icon={faFacebook} className='size-4 md:size-5' />
        ),
        href: 'https://www.facebook.com/groups/sniper155clubofthephilippinesofficial',
        label: 'S155CP Official Group',
    },
    {
        icon: <FontAwesomeIcon icon={faGoogle} className='size-4 md:size-5' />,
        href: 'https://forms.gle/x2oWv29Sb54RikV17',
        label: 'S155CP Invitation Form',
    },
];
