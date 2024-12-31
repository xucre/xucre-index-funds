import React, { useEffect, useMemo, useState } from 'react';
import mixpanelFull, { Mixpanel } from 'mixpanel-browser';
import { useOrganization } from '@clerk/nextjs';
import { createCustomer, createPortalLink, getCustomer, getCustomerSubscription } from '@/service/billing/stripe';
import Stripe from 'stripe';
import { useClerkUser } from './useClerkUser';

export function useStripeBilling() {
  const { organization } = useOrganization();
  const { user } = useClerkUser();
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [seatCount, setSeatCount] = useState(0);
  const [subscription, setSubscription] = useState<Stripe.Subscription | null>(null);
  const [portalSession, setPortalSession] = useState<Stripe.BillingPortal.Session | null>(null);

  const reset = async () => {
    if (!organization) return;

    const data = (await getCustomerSubscription(organization.id));
    const _subscription = data ? data.subscription as Stripe.Subscription : null;
    if (_subscription && (_subscription.status === 'active' || _subscription.status === 'trialing')) {
      setPortalSession(data.portal);
      setSubscription(_subscription);
      setHasSignedUp(true);
      setSeatCount(_subscription.items.data[0].quantity as number);
    } else {
      setHasSignedUp(false);
    }

    const customerData = await getCustomer(organization.id);
    if (customerData) {
      setCustomerId(customerData.id);
    } else {
      const _id = await createStripeAccount();
      if (!_id) return;
      setCustomerId(_id);
    }
  }

  const createStripeAccount = async () => {
    if (!organization) return;
    if (!user || !user.primaryEmailAddress) return;
    const customer = await createCustomer(organization.name, user.primaryEmailAddress.emailAddress, organization.id);
    return customer;
  }

  const openPortal = async () => {
    const portalUrl = await createPortalLink(customerId);
    if (!portalUrl) return;
    window.location.assign(portalUrl);
  }

  useEffect(() => {
    if (organization && organization.id) {
      reset();
    }
  }, [organization])

  return useMemo(
    () => ({ hasSignedUp, organization, seatCount, subscription, portalSession, createStripeAccount, openPortal, reset }),
    [organization, hasSignedUp],
  );
}