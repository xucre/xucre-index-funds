import { getOrganization, updateOrganizationLicenses } from "@/service/clerk";
import { upsertOrganization } from "@/service/sfdc";
import { getCustomerSubscription } from "@/service/stripe";
import { NextRequest } from "next/server"
import Stripe from "stripe";

export const dynamic = 'force-static'
 
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  try {
    const pathParams = request.nextUrl.href.split('/');
    const organizationId = pathParams[pathParams.length - 1];
    const organizationData = await getOrganization(organizationId);
    const subscriptionData = await getCustomerSubscription(organizationId);
    const _subscription = subscriptionData.subscription as Stripe.Subscription;
    if (_subscription && (_subscription.status === 'active' || _subscription.status === 'trialing')) {
      const seatCount = _subscription.items.data[0].quantity;
      await upsertOrganization(organizationId, organizationData.name, seatCount);
      await updateOrganizationLicenses(organizationId, seatCount);
    } else {
      await upsertOrganization(organizationId, organizationData.name, 1);
      await updateOrganizationLicenses(organizationId, 1);
    }
    return Response.redirect(`${origin}/billing`);
  } catch (err) {
    console.log('error with stripe callback', err);
    return Response.redirect(`${origin}/billing`);
  }
  
}

//http://localhost:3000/api/stripe/callback/org_2ml6npZFYKzFTqdq1wYwagOpzYz