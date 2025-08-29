import LogoProvider from '@/components/providers/LogoProvider';
import fs from 'fs';
import path from 'path';

export default function NFCIDLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const filePath = path.join(process.cwd(), 'src/assets/national.txt');
    const logo = fs.readFileSync(filePath, 'utf8');

    return <LogoProvider logo={logo}>{children}</LogoProvider>;
}
