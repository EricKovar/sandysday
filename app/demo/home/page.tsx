import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {demoUser} from '../../../lib/demo-session';
import Home from '../../../components/senior-home';
export const dynamic='force-dynamic';
export default async function Demo(){const user=await demoUser((await headers()).get('cookie'));if(!user)redirect('/demo');return <Home demo demoAccount={user.userId} key={user.userId}/>}
