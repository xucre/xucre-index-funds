
'use server'

import Stripe from 'stripe';
import superagent from 'superagent';

const STRIPE_API_URL = 'https://api.stripe.com/v1';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const DOMAIN = process.env.DOMAIN ? process.env.DOMAIN : 'app.xucre.net';
//const logging = require('../loaders/logging');
const OnrampSessionResource = Stripe.StripeResource.extend({
    create: Stripe.StripeResource.method({
      method: 'POST',
      path: 'crypto/onramp_sessions',
    }),
  });
const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

export async function getCustomerSubscription (organization) {
    try {
        const subscriptionData = await stripe.subscriptions.search({
            query: "status:'active' AND metadata['organization']:'" + organization + "'"
        });
        if (subscriptionData.data.length > 0) {
            const subscription = subscriptionData.data[0]; //subscription.customer;
            //console.log(subscription)
            const invoices = await stripe.invoices.search({
                query: "customer:'" + subscription.customer + "'"
            });

            const portalSession = await stripe.billingPortal.sessions.create({
                customer: subscription.customer as string,
                return_url: `http://${DOMAIN}/api/stripe/callback?organization=${organization}`
            });
            //console.log(portalSession);
            return JSON.parse(JSON.stringify({ subscription, invoices: invoices.data, portal: portalSession }));
        } else {
            //return subscriptionData.data[0];
            return null;
        }
        //console.log(subscription);
    } catch (err) {
        console.log(err);
        return null;
    }
};


export async function createCheckout (organzationId: string) {
  try {
      //console.log('create checkout', `/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`);
      const sess = await stripe.checkout.sessions.create({
          mode: 'subscription',
          line_items: [
              {
                  price: priceId,
                  quantity: 1
              }
          ],
          metadata: {
            organzationId
          },
          // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
          //success_url: `/api/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
          success_url: `/billing`,
          cancel_url: `/billing`
          // automatic_tax: { enabled: true }
      });
      //console.log(sess);
      return sess.url;
  } catch (err) {
      return null;
  }
};

export async function createInvoice (customer: string, amount: number) {
    try {
        const invoice = await stripe.invoices.create({
            customer,
            collection_method: 'send_invoice',
            days_until_due: 30
        });

        const item = await stripe.invoices.addLines(invoice.id, {
            lines: [
              {
                description: 'Disbursement For Users',
                amount: amount * 100,
                quantity: 1
              },
              {
                description: 'Transaction Fees',
                amount: (amount*100)*0.05,
                quantity: 1
              }
            ]
        }) ;
        return invoice;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function checkoutSuccess (sessionId) {
  try {
      console.log('checkout success');
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      //console.log(session);
      await stripe.subscriptions.update(session.subscription as string, { metadata: { organization: session.client_reference_id } });
      //console.log(subscription);
      return 'success'
  } catch (err) {
      console.log(err);
      return null;
  }
};

export async function generateToken (invoiceId: string, organizationId: string, escrowWallet: string, amount: number) {
    try {                
        const response = await superagent
            .post(`${STRIPE_API_URL}/crypto/onramp_sessions`)
            .auth(process.env.STRIPE_SECRET_KEY, '')
            .send(`
                wallet_addresses[polygon]=${escrowWallet}&
                source_currency=usd&
                destination_currency=usdc&
                destination_network=polygon&
                source_amount=${amount}&
                metadata[organization]=${organizationId}&
                metadata[invoiceId]=${invoiceId}&
                lock_wallet_address=true`)
            .withCredentials();
            //console.log(response.body);
        return response.body;
    } catch (error) {
        console.log(error);
        //return null;
    }
}
