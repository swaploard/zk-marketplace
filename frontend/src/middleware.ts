import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/', '/create', "/api/files"];
const publicRoutes = ['/login', '/signup'];

export default async function middleware(req: NextRequest) {

  const path = req.nextUrl.pathname;
  const cookie = req.cookies.get("siwe-session");;

  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  
  const apiPath = () => {
    if(path.includes("api/auth")){
      return false ;
    }else if(path.includes("api/files")){
      return true;
    }
  }

  if(!cookie && apiPath()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

  if (isProtectedRoute && !cookie) {
    const redirectUrl = new URL("/signup", req.url);
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname); 
    
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicRoute && cookie) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/create", "/api/:path*"],
};
