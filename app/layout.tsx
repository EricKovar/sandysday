import type { Metadata } from 'next';
import './globals.css';
import {ViewportSize} from '../components/viewport-size';
export const metadata:Metadata={title:'Sandy’s Day · Your day, with Sandy',description:'A conversation-led daily companion. Private experimental preview.',icons:{icon:[{url:'/favicon-32-copper.png',sizes:'32x32',type:'image/png'},{url:'/favicon-192-copper.png',sizes:'192x192',type:'image/png'}],shortcut:'/favicon.ico',apple:'/apple-touch-icon-copper.png'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><ViewportSize/>{children}</body></html>}
