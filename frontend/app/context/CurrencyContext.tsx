"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CurrencyConfig = {
  code: string;
  symbol: string;
  rate: number;
  locale: string;
};

const DEFAULT_RATES: Record<string, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", rate: 1, locale: "en-IN" },
  USD: { code: "USD", symbol: "$", rate: 0.012, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", rate: 0.011, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", rate: 0.0094, locale: "en-GB" },
  AED: { code: "AED", symbol: "AED ", rate: 0.044, locale: "ar-AE" },
  CAD: { code: "CAD", symbol: "CA$", rate: 0.016, locale: "en-CA" },
  AUD: { code: "AUD", symbol: "AU$", rate: 0.018, locale: "en-AU" },
};

type CurrencyContextType = {
  currency: CurrencyConfig;
  formatPrice: (amountInINR?: number) => string;
  loading: boolean;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_RATES.INR,
  formatPrice: (amountInINR = 0) => `₹${amountInINR.toLocaleString("en-IN")}`,
  loading: true,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyConfig>(DEFAULT_RATES.INR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initCurrencyAndRates() {
      try {
        // 1. Fetch live INR exchange rates
        const rateRes = await fetch("https://open.er-api.com/v6/latest/INR").catch(() => null);
        let fetchedRates: Record<string, number> = {};
        if (rateRes && rateRes.ok) {
          const rateData = await rateRes.json();
          if (rateData && rateData.rates) {
            fetchedRates = rateData.rates;
          }
        }

        // 2. Detect IP Geo-Location
        const geoRes = await fetch("https://ipapi.co/json/").catch(() => null);
        if (geoRes && geoRes.ok) {
          const geoData = await geoRes.json();
          const countryCode = geoData?.country_code;

          let detectedCode = "INR";
          if (countryCode === "US") detectedCode = "USD";
          else if (countryCode === "GB") detectedCode = "GBP";
          else if (["DE", "FR", "IT", "ES", "NL", "BE", "AT", "IE", "PT", "FI"].includes(countryCode)) detectedCode = "EUR";
          else if (countryCode === "AE") detectedCode = "AED";
          else if (countryCode === "CA") detectedCode = "CAD";
          else if (countryCode === "AU") detectedCode = "AUD";
          else if (countryCode !== "IN" && countryCode) detectedCode = "USD";

          const baseConfig = DEFAULT_RATES[detectedCode] || DEFAULT_RATES.INR;
          const liveRate = fetchedRates[detectedCode] || baseConfig.rate;

          setCurrency({
            ...baseConfig,
            rate: liveRate,
          });
        }
      } catch (err) {
        console.error("Geo currency detection error:", err);
      } finally {
        setLoading(false);
      }
    }

    initCurrencyAndRates();
  }, []);

  const formatPrice = (amountInINR: number = 0): string => {
    if (typeof amountInINR !== "number" || isNaN(amountInINR)) return `${currency.symbol}0`;
    const converted = amountInINR * currency.rate;
    const fractionDigits = currency.code === "INR" ? 0 : 2;
    return `${currency.symbol}${converted.toLocaleString(currency.locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
