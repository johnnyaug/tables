import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.scss';
import NoSsr from './NoSsr';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'קישורים',
  description: 'מצאו ארבע קבוצות של ארבע מילים',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he">

      <body className={inter.className}>
        <link rel="icon" type="image/x-icon" href="/favicon.png" />
        <NoSsr>
          <div className='header mb-5 d-flex justify-content-center' dir='rtl'>
            <div>
              <span className='h1 fw-bold'>קישורים&nbsp;</span>
              <span className='h5'>{new Date().toLocaleDateString('he-IL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }
              )}</span>
            </div>
          </div>
          <div className='d-flex justify-content-center mb-3' dir='rtl'>
            <h5 className='fw-light'>מצאו ארבע קבוצות של ארבע!</h5>
          </div>
          {children}
        </NoSsr>
      </body>
    </html >
  )
}
