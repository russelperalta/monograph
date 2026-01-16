import type { Metadata } from "next";
import localFont from 'next/font/local';
import './styles/globals.scss';
// import { Geist, Geist_Mono } from "next/font/google";

const headingFont = localFont ({
  src: '../public/fonts/Loos_ExtraWide_Bold.otf',
  weight: '500',
  display: 'swap',
  variable: '--font-headingFont',
})
const mainFont = localFont ({
  src: [
    {
      path: '../public/fonts/WorkSans-Light.ttf',
      weight: '400',
      style: 'normal', 
    },
    {
      path: '../public/fonts/WorkSans-SemiBold.ttf',
      weight: '500',
      style: 'normal', 
    },
    {
      path: '../public/fonts/WorkSans-Bold.ttf',
      weight: '600',
      style: 'normal', 
    },
  ],
  variable: '--font-main',
})

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Monograph",
  description: "Directed by Andrew Pham",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
