import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, jwtVerify } from 'jose';
import { DecodedTokenPayload } from './utils/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

async function verifyJWT(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload;
    } catch (e) {
      return null;
    }
  }
export async function middleware(request:NextRequest) {
  const token = request.cookies.get('auth_token')?.value || 
  '';
  const { pathname } = request.nextUrl;
  if (!token && (pathname.startsWith('/type1_home') || pathname.startsWith('/type2_home'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token) {
    try {
      const decoded:JWTPayload =  await verifyJWT(token) || {};
      console.log(decoded,'decoded')
      const userType = decoded.user_type;
      if (pathname === '/') {
        const redirectUrl = userType === 'type_1' ? '/type1_home' : '/type2_home';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      if (pathname === '/type1_home' && userType !== 'type_1') {
        return NextResponse.redirect(new URL('/type2_home', request.url));
      }
      
      if (pathname === '/type2_home' && userType !== 'type_2') {
        return NextResponse.redirect(new URL('/type1_home', request.url));
      }

    } catch (error) {
      if (pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-debug', 'middleware reached');
return response;
}

export const config = {
  matcher: ['/', '/type1_home', '/type2_home']
};