import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.scss';
import NoSsr from './NoSsr';

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tables',
  description: 'נחשו איזה אוכל זה לפי טבלת הערכים התזונתיים',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={"anonymous"}/>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet"></link>
      </head>
      <body>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <NoSsr>
          <div className='header mb-5 d-flex justify-content-center' dir='rtl'>
            <div>
              <div className='h1 game-header'>TABLES</div>
              <div className='fw-light'>[{new Date().toLocaleDateString('he-IL', {
                // weekday: 'narrow',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }
              )}]</div>
            </div>
          </div>
          <div className='d-flex justify-content-center mb-3' dir='rtl'>
            <h5>כמו מה זה נראה לכם?</h5>
          </div>
          {children}
        </NoSsr>
      </body>
    </html >
  )
}
