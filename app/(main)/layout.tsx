import Header from '@/app/ui/components/Header';
import Footer from '@/app/ui/components/Footer';
import VerificationProcessDrawer from '../ui/components/info/VerificationProcessDrawer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <VerificationProcessDrawer />
    </>
  );
}
