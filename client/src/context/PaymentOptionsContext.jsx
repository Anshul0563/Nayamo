import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { settingsAPI } from "../services/api";

const PaymentOptionsContext = createContext(null);

export const COD_UNAVAILABLE_MESSAGE = "COD is not available at your region";

export function PaymentOptionsProvider({ children }) {
  const [codEnabled, setCodEnabled] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshPaymentOptions = useCallback(async () => {
    setLoading(true);

    try {
      const response = await settingsAPI.getPaymentOptions();
      const options = response.data?.data || response.data;

      // Existing stores that predate this setting are treated as COD-enabled.
      setCodEnabled(options?.codEnabled !== false);
    } catch {
      // Do not advertise a payment option until its availability is confirmed.
      setCodEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPaymentOptions();
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
