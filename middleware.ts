import { clerkMiddleware, ClerkMiddlewareAuth, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextMiddleware, NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher(['/', '/about-us(.*)', '/index-fund(.*)'])
const isAdminRoute = createRouteMatcher(['/index-builder(.*)', '/organization(.*)', '/billing(.*)'])
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((_auth, req) => {
  const auth = _auth();
  if (isPublicRoute(req)) return;
  if (!auth.userId) {
    // Add custom logic to run before redirecting
    return auth.redirectToSignIn()
  } else if (isAdminRoute(req)) {
    auth.protect((has) => {
      return (
        has({ role: 'org:admin' })
      )
    })
  } else if (isProtectedRoute(req)) {
    auth.protect((has) => {
      return (
        auth.orgId !== undefined && auth.orgId !== null
      )
    })
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
  //matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
