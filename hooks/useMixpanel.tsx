import React from 'react';
import mixpanelFull, { Mixpanel } from 'mixpanel-browser';

const MixpanelContext = React.createContext({} as Mixpanel);

export const useMixpanel = () => React.useContext(MixpanelContext);

export const MixpanelProvider = ({ children }: { children: any }) => {
  const [mixpanel, setMixpanel] = React.useState(null as Mixpanel | null);

  React.useEffect(() => {
    //const trackAutomaticEvents = true;
    if (false) {
      mixpanelFull.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
        debug: true,
        track_pageview: true,
        persistence: "localStorage",
      });
      setMixpanel(mixpanelFull);
    }
    //mixpanelInstance.init();
    //setMixpanel(mixpanelInstance);
  }, []);

  return <MixpanelContext.Provider value={mixpanel}>{children}</MixpanelContext.Provider>;
};