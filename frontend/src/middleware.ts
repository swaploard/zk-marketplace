import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/create",
  "/create/collection",
  "/collection/",
  "/user/profile",
  "/api/files",
  "/api/profile",
];
const publicRoutes = ["/login", "/signup"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const walletAddress = req.cookies.get("walletAddress")?.value;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const apiPath = () => {
    if (path.includes("api/auth")) {
      return false;
    } else if (path.includes("api/files")) {
      return true;
    }
  };

  if (!walletAddress && apiPath()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isProtectedRoute && !walletAddress) {
    const redirectUrl = new URL("/signup", req.url);
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);

    return NextResponse.redirect(redirectUrl);
  }
  if (isPublicRoute && walletAddress) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher:  ["/create/:path*", "/user/:path*", "/api/:path*"],
};
