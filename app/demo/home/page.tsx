import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {demoUser} from '../../../lib/demo-session';
import Home from '../../../components/senior-home';
export const dynamic='force-dynamic';
export default async function Demo(){if(!await demoUser((await headers()).get('cookie')))redirect('/demo');return <Home demo key="guest-demo"/>}
