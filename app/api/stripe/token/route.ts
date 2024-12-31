import { NextRequest } from "next/server"
import Stripe from "stripe";

export const dynamic = 'force-static'
 
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  try {
    const pathParams = request.nextUrl.href.split('/');
    const organizationId = pathParams[pathParams.length - 1];
    
    return Response.redirect(`${origin}/billing`);
  } catch (err) {
    console.log('error with stripe callback', err);
    return Response.redirect(`${origin}/billing`);
  }
  
}

//http://localhost:3000/api/stripe/callback/org_2ml6npZFYKzFTqdq1wYwagOpzYz