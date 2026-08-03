import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { settingsAPI } from "../services/api";

const PaymentOptionsContext = createContext(null);
const PAYMENT_OPTIONS_REFRESH_INTERVAL = 30_000;

export const COD_UNAVAILABLE_MESSAGE = "COD is not available at your region";

export function PaymentOptionsProvider({ children }) {
  const [codEnabled, setCodEnabled] = useState(null);
  const [loading, setLoading] = useState(true);
  const latestRequestRef = useRef(0);
  const activeForegroundRequestRef = useRef(0);

  const refreshPaymentOptions = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++latestRequestRef.current;

    if (!silent) {
      activeForegroundRequestRef.current = requestId;
      setLoading(true);
    }

    try {
      const response = await settingsAPI.getPaymentOptions();
      const options = response.data?.data || response.data;

      // Existing stores that predate this setting are treated as COD-enabled.
      if (requestId === latestRequestRef.current) {
        setCodEnabled(options?.codEnabled !== false);
      }
    } catch {
      // Do not advertise a payment option until its availability is confirmed.
      if (requestId === latestRequestRef.current) {
        setCodEnabled(false);
      }
    } finally {
      if (!silent && requestId === activeForegroundRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refreshPaymentOptions();

    // Keep long-lived storefront pages in sync after an admin changes COD.
    // Background refreshes deliberately keep the existing UI state visible.
    const refreshInBackground = () => {
      if (document.visibilityState !== "hidden") {
        refreshPaymentOptions({ silent: true });
      }
    };

    const intervalId = window.setInterval(
      refreshInBackground,
      PAYMENT_OPTIONS_REFRESH_INTERVAL,
    );

    window.addEventListener("focus", refreshInBackground);
    document.addEventListener("visibilitychange", refreshInBackground);

    return () => {
      latestRequestRef.current += 1;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshInBackground);
      document.removeEventListener("visibilitychange", refreshInBackground);
    };
  }, [refreshPaymentOptions]);

  return (
    <PaymentOptionsContext.Provider
      value={{ codEnabled, loading, refreshPaymentOptions }}
    >
      {children}
    </PaymentOptionsContext.Provider>
  );
}

export function usePaymentOptions() {
  const context = useContext(PaymentOptionsContext);

  if (!context) {
    throw new Error(
      "usePaymentOptions must be used within a PaymentOptionsProvider",
    );
  }

  return context;
}
