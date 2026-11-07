import {headers} from 'next/headers';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {demoIdentity} from './demo-circle';
export async function getAppUser(request?:Request){
 const h=request?.headers||await headers();
 const isDemo=h.get('x-sandys-demo')==='1'||(request?new URL(request.url).searchParams.get('demo')==='1':false);
 // Explicit demo requests never fall back to the signed-in account.
 if(isDemo){const role=h.get('x-sandys-demo-role')||(request?new URL(request.url).searchParams.get('role'):null)||'senior';if(!['senior','caregiver'].includes(role))return null;return demoIdentity(h.get('cookie'),role,h.get('x-sandys-demo-account'))}
 return getChatGPTUser();
}
