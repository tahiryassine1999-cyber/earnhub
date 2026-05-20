import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'EarnHub — Survey & Offer Wall Earning Platform',
  description: 'Earn real rewards by completing surveys, tasks, and offers on EarnHub. Beautiful, fast, and high-paying.',
  keywords: 'earn money online, surveys for cash, offerwalls, rewards platform, nextjs rewards',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
