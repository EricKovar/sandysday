import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Sandy’s Day · Your day, with Cindy',description:'A conversation-led daily companion. Private experimental preview.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
