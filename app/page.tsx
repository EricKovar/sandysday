import Home from '../components/senior-home';
import {getChatGPTUser} from './chatgpt-auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page(){if(!await getChatGPTUser())redirect('/demo');return <Home key="signed-in"/>}
