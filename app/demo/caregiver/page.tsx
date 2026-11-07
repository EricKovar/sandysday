import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {demoIdentity} from '../../../lib/demo-circle';
import {DemoCaregiver} from '../../../components/demo-caregiver';
export const dynamic='force-dynamic';
export default async function Page(){const user=await demoIdentity((await headers()).get('cookie'),'caregiver');if(!user)redirect('/demo');return <DemoCaregiver demoAccount={user.userId} key={user.userId}/>}
