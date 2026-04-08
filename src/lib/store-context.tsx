import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Currency = "USD" | "XCD";

interface StoreSettings {
  currency_rate: { usd_to_xcd: number };
  whatsapp: { number: string; sales_manager: string };
  store_info: { email: string; phone: string };
}

interface StoreContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  formatPrice: (priceUsd: number, priceXcd: number) => string;
  formatPriceBoth: (priceUsd: number, priceXcd: number) => { primary: string; secondary: string };
  whatsappNumber: string;
  salesManager: string;
  storeEmail: string;
  storePhone: string;
  saintLuciaPhone1: string;
  saintLuciaPhone2: string;
  isLocalVisitor: boolean;
  setIsLocalVisitor: (isLocal: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [exchangeRate, setExchangeRate] = useState(2.70);
  const [whatsappNumber, setWhatsappNumber] = useState("+13059429407");
  const [salesManager, setSalesManager] = useState("Goddess Itopia Archer");
  const [storeEmail, setStoreEmail] = useState("goddessitopia@mountkailashslu.com");
  const [storePhone, setStorePhone] = useState("+13059429407");
  const [saintLuciaPhone1, setSaintLuciaPhone1] = useState("+17582855195");
  const [saintLuciaPhone2, setSaintLuciaPhone2] = useState("+17587223660");
  const [isLocalVisitor, setIsLocalVisitor] = useState(false);

  useEffect(() => {
    // Load settings from database
    const loadSettings = async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("key, value");
      
      if (data) {
        data.forEach((setting) => {
          const value = setting.value as Record<string, unknown>;
          switch (setting.key) {
            case "currency_rate":
              setExchangeRate((value as StoreSettings["currency_rate"]).usd_to_xcd);
              break;
            case "whatsapp":
              setWhatsappNumber((value as StoreSettings["whatsapp"]).number);
              setSalesManager((value as StoreSettings["whatsapp"]).sales_manager);
              break;
            case "store_info":
              setStoreEmail((value as StoreSettings["store_info"]).email);
              setStorePhone((value as StoreSettings["store_info"]).phone);
              break;
            case "saint_lucia_phone_1":
              if (typeof setting.value === "string") setSaintLuciaPhone1(setting.value);
              break;
            case "saint_lucia_phone_2":
              if (typeof setting.value === "string") setSaintLuciaPhone2(setting.value);
              break;
          }
        });
      }
    };

    loadSettings();

    // Detect visitor location for currency default
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.country_code === "LC") {
          setCurrency("XCD");
          setIsLocalVisitor(true);
        }
      } catch (error) {
        console.log("Could not detect location, defaulting to USD");
      }
    };

    detectLocation();

    // Load saved preference
    const savedCurrency = localStorage.getItem("preferred_currency") as Currency;
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem("preferred_currency", newCurrency);
  };

  const formatPrice = (priceUsd: number, priceXcd: number) => {
    if (currency === "XCD") {
      return `EC$${priceXcd.toFixed(2)}`;
    }
    return `US$${priceUsd.toFixed(2)}`;
  };

  const formatPriceBoth = (priceUsd: number, priceXcd: number) => {
    if (currency === "XCD") {
      return {
        primary: `EC$${priceXcd.toFixed(2)}`,
        secondary: `US$${priceUsd.toFixed(2)}`,
      };
    }
    return {
      primary: `US$${priceUsd.toFixed(2)}`,
      secondary: `EC$${priceXcd.toFixed(2)}`,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        exchangeRate,
        formatPrice,
        formatPriceBoth,
        whatsappNumber,
        salesManager,
        storeEmail,
        storePhone,
        saintLuciaPhone1,
        saintLuciaPhone2,
        isLocalVisitor,
        setIsLocalVisitor,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    // Return safe defaults instead of throwing — prevents blank screens
    // when components render outside StoreProvider during error recovery
    return {
      currency: "USD" as Currency,
      setCurrency: (() => {}) as (currency: Currency) => void,
      exchangeRate: 2.70,
      formatPrice: (usd: number, _xcd: number) => `$${usd.toFixed(2)}`,
      formatPriceBoth: (usd: number, _xcd: number) => ({ primary: `$${usd.toFixed(2)}`, secondary: "" }),
      whatsappNumber: "+13059429407",
      salesManager: "Goddess Itopia Archer",
      storeEmail: "goddessitopia@mountkailashslu.com",
      storePhone: "+13059429407",
      saintLuciaPhone1: "+17582855195",
      saintLuciaPhone2: "+17587223660",
      isLocalVisitor: false,
      setIsLocalVisitor: (() => {}) as (isLocal: boolean) => void,
    } satisfies StoreContextType;
  }
  return context;
}
