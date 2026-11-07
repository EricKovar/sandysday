import {checkOrigin} from '../../lib/server-cindy';
import {DEMO_COOKIE,DEMO_TTL,createDemoToken,demoUser} from '../../lib/demo-session';
export async function GET(request:Request){
 const url=new URL(request.url);if(!url.searchParams.has('new')&&await demoUser(request.headers.get('cookie')))return Response.redirect(new URL('/demo/home',url),303);
 return startDemo(url);
}
export async function POST(request:Request){
 if(!checkOrigin(request))return new Response('Forbidden',{status:403});
 return startDemo(new URL(request.url));
}
async function startDemo(url:URL){
 try{const token=await createDemoToken();return new Response(null,{status:303,headers:{Location:new URL('/demo/home',url).href,'Set-Cookie':`${DEMO_COOKIE}=${token}; Path=/; Max-Age=${DEMO_TTL/1000}; HttpOnly; Secure; SameSite=Lax`,'Cache-Control':'no-store'}})}catch{return new Response('The demo is temporarily unavailable. Please try again shortly.',{status:503})}
}
