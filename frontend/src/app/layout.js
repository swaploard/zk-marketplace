import './globals.css';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { Toaster } from 'react-hot-toast';
import { authConfig } from '../../auth';
import Providers from './authProviders/Providers';
import AutoConnect from '../components/connection';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NFT Market',
  description: 'NFT Market',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authConfig);
  const headersList = await headers();
  const cookie = headersList.get('cookie');

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session} cookie={cookie}>
          <AutoConnect />
          <Toaster position="top-right" cy-toaster="global-toaster" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
