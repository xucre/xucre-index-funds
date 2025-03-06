import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/about-us(.*)', '/privacy(.*)', '/indexes(.*)'])
const isAdminRoute = createRouteMatcher(['/organization(.*)', '/organization/organization-members(.*)', '/billing(.*)', '/api/billing(.*)', '/api/invoice(.*)', '/company(.*)'])
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/edit(.*)', '/settings(.*)', '/wallets(.*)', '/transactions(.*)', '/api(.*)', '/fund(.*)'])
const isInternalRoute = createRouteMatcher(['/organizations(.*)', '/index-manager(.*)', '/index-builder(.*)', '/features/(.*)'])

export const adminUserList = (process.env.ADMIN_USER_LIST as string).split(',');

export default clerkMiddleware(async (auth, req) => {
  
  const _auth = await auth();
  if (isPublicRoute(req)) return;
  if (!_auth.userId) {
    return _auth.redirectToSignIn()
  } else if (isInternalRoute(req)) {
    auth.protect((has) => {
      return (
        has({role: 'org:superadmin'}) || adminUserList.includes(_auth.userId)
      )
    })
  }/* else if (isAdminRoute(req)) {
    auth.protect((has) => {
      return (
        has({ role: 'org:admin' }) || has({role: 'org:superadmin'}) || adminUserList.includes(_auth.userId)
      )
    })
  } */else if (isProtectedRoute(req) || isAdminRoute(req)) {
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
