import ReactGA from "react-ga4";

const isProd = import.meta.env.VITE_PROD;
console.log("isprod", isProd);

export const initAnalytics = () => {
  if (!isProd) return;

  ReactGA.initialize(import.meta.env.VITE_GA_ID);

  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", import.meta.env.VITE_CLARITY_ID);
};

export const trackPageView = (path) => {
  if (!isProd) return;
  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = ({ category, action, label }) => {
  if (!isProd) return;
  ReactGA.event({ category, action, label });
};

export const setAnalyticsUser = (userId, role) => {
  if (!isProd) return;
  ReactGA.set({ user_id: userId, ...(role && { user_role: role }) });
  if (window.clarity) {
    window.clarity("identify", userId);
    if (role) window.clarity("set", "user_role", role);
  }
};
