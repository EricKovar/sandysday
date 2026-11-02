import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {demoIdentity} from '../../../lib/demo-circle';
import {DemoCaregiver} from '../../../components/demo-caregiver';
export const dynamic='force-dynamic';
export default async function Page(){if(!await demoIdentity((await headers()).get('cookie'),'caregiver'))redirect('/demo');return <DemoCaregiver/>}
