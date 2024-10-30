import React, { useEffect, useMemo, useState } from 'react';
import mixpanelFull, { Mixpanel } from 'mixpanel-browser';
import { useOrganization, useUser } from '@clerk/nextjs';
import { getCustomerSubscription } from '@/service/stripe';
import Stripe from 'stripe';

export function useStripeBilling() {
  const { organization } = useOrganization();
  const [hasSignedUp, setHasSignedUp] = useState(false);
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
      setSeatCount(_subscription.items.data[0].quantity);
    } else {
      setHasSignedUp(false);
    }
  }

  useEffect(() => {
    if (organization && organization.id) {
      reset();
    }
  }, [organization])

  return useMemo(
    () => ({ hasSignedUp, organization, seatCount, subscription, portalSession, reset }),
    [organization, hasSignedUp],
  );
}