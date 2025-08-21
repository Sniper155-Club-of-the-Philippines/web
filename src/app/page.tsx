import Container from '@/components/root/Container';
import Header from '@/components/root/Header';
import Footer from '@/components/root/Footer';
import HomePanel from '@/components/root/HomePanel';

export default function Home() {
    return (
        <>
            <Header />
            <Container>
                <HomePanel />
            </Container>
            <Footer />
        </>
    );
}
