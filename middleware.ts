import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/about-us(.*)', '/index-fund(.*)', '/index-builder(.*)'])
const isAdminRoute = createRouteMatcher(['/organization(.*)', '/billing(.*)'])
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/edit(.*)', '/settings(.*)', '/wallets(.*)', '/transactions(.*)', '/api(.*)'])

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
    auth.protect(() => {
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
