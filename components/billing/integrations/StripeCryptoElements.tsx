import React, { RefObject } from 'react';

// ReactContext to simplify access of StripeOnramp object
const CryptoElementsContext =
  React.createContext({
    onramp: {} as any,
  });
CryptoElementsContext.displayName = 'CryptoElementsContext';

export const CryptoElements = ({
  stripeOnramp,
  children,
}) => {
  const [ctx, setContext] = React.useState(() => ({
    onramp: {} as any,
  }));

  React.useEffect(() => {
    let isMounted = true;

    Promise.resolve(stripeOnramp).then((onramp) => {
      if (onramp && isMounted) {
        setContext((ctx) => (ctx.onramp ? ctx : { onramp }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stripeOnramp]);

  return (
    <CryptoElementsContext.Provider value={ctx}>
      {children}
    </CryptoElementsContext.Provider>
  );
};

// React hook to get StripeOnramp from context
export const useStripeOnramp = () => {
  const context = React.useContext(CryptoElementsContext);
  return context?.onramp;
};

// React element to render Onramp UI
const useOnrampSessionListener = (
  type,
  session,
  callback
) => {
  React.useEffect(() => {
    if (session && callback) {
      const listener = (e) => callback(e.payload);
      session.addEventListener(type, listener);
      return () => {
        session.removeEventListener(type, listener);
      };
    }
    return () => {};
  }, [session, callback, type]);
};

export const OnrampElement = ({
  clientSecret,
  appearance,
  onReady,
  onChange,
  ...props
}) => {
  const stripeOnramp = useStripeOnramp();
  const onrampElementRef = React.useRef({} as RefObject<HTMLDivElement>);
  const [session, setSession] = React.useState();

  const appearanceJSON = JSON.stringify(appearance);
  React.useEffect(() => {
    const containerRef = onrampElementRef.current;
    if (containerRef && containerRef.current) {
      // NB: ideally we want to be able to hot swap/update onramp iframe
      // This currently results a flash if one needs to mint a new session when they need to udpate fixed transaction details
      containerRef.current.innerHTML = '';

      if (clientSecret && stripeOnramp) {
        setSession(
          stripeOnramp
            .createSession({
              clientSecret,
              appearance: appearanceJSON ? JSON.parse(appearanceJSON) : {}
            })
            .mount(containerRef)
        );
      }
    }
  }, [appearanceJSON, clientSecret, stripeOnramp]);

  useOnrampSessionListener('onramp_ui_loaded', session, onReady);
  useOnrampSessionListener('onramp_session_updated', session, onChange);
  if (!onrampElementRef) return;
  return <div {...props} ref={onrampElementRef.current}></div>;
};