import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar/Navbar';
import MandiTicker from '@/components/MandiTicker/MandiTicker';
import GoogleTranslate from '@/components/GoogleTranslate/GoogleTranslate';
import AnnouncementBar from '@/components/AnnouncementBar/AnnouncementBar';

export const metadata = {
  title: 'AgroLink — Fair Deals, Straight From the Field',
  description: 'AgroLink connects farmers directly with buyers. No middlemen, real pay, transparent supply chain tracking.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <AnnouncementBar />
          <Navbar />
          <MandiTicker />
          <main>{children}</main>
          <GoogleTranslate />

        </AuthProvider>
      </body>
    </html>
  );
}
