import {headers} from 'next/headers';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {demoUser} from './demo-session';
export async function getAppUser(request?:Request){
 const h=request?.headers||await headers();
 const isDemo=h.get('x-sandys-demo')==='1'||(request?new URL(request.url).searchParams.get('demo')==='1':false);
 // Explicit demo requests never fall back to the signed-in account.
 if(isDemo)return demoUser(h.get('cookie'));
 return getChatGPTUser();
}
