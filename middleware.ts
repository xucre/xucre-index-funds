import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/about-us(.*)', '/privacy(.*)'])
const isAdminRoute = createRouteMatcher(['/organization(.*)', '/organization/organization-members(.*)', '/billing(.*)', '/api/billing(.*)', '/api/invoice(.*)'])
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/edit(.*)', '/settings(.*)', '/wallets(.*)', '/transactions(.*)', '/api(.*)', '/fund(.*)'])
const isInternalRoute = createRouteMatcher(['/organizations(.*)', '/index-manager(.*)', '/index-builder(.*)'])

export const adminUserList = (process.env.ADMIN_USER_LIST as string).split(',');

export default clerkMiddleware(async (auth, req) => {
  const _auth = await auth();
  if (isPublicRoute(req)) return;
  if (!_auth.userId) {
    // Add custom logic to run before redirecting
    return _auth.redirectToSignIn()
  } else if (isInternalRoute(req)) {
    auth.protect((has) => {
      return (
        has({role: 'org:superadmin'}) || adminUserList.includes(_auth.userId)
      )
    })
  } else if (isAdminRoute(req)) {
    auth.protect((has) => {
      return (
        has({ role: 'org:admin' }) || has({role: 'org:superadmin'})
      )
    })
  } else if (isProtectedRoute(req)) {
    auth.protect(() => {
      return (
        _auth.userId !== undefined && _auth.userId !== null
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
