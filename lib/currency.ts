const REGION_TO_CURRENCY: Record<string, string> = {
  US: "USD",
  BD: "BDT",
  IN: "INR",
  PK: "PKR",
  NP: "NPR",
  LK: "LKR",
  GB: "GBP",
  IE: "EUR",
  FR: "EUR",
  DE: "EUR",
  ES: "EUR",
  IT: "EUR",
  PT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
  CY: "EUR",
  MT: "EUR",
  SI: "EUR",
  SK: "EUR",
  LV: "EUR",
  LT: "EUR",
  EE: "EUR",
  AU: "AUD",
  NZ: "NZD",
  CA: "CAD",
  SG: "SGD",
  MY: "MYR",
  TH: "THB",
  ID: "IDR",
  PH: "PHP",
  VN: "VND",
  JP: "JPY",
  KR: "KRW",
  CN: "CNY",
  HK: "HKD",
  TW: "TWD",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  OM: "OMR",
  BH: "BHD",
  ZA: "ZAR",
  NG: "NGN",
  EG: "EGP",
  BR: "BRL",
  MX: "MXN",
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  TR: "TRY",
  RU: "RUB",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  RO: "RON",
  IL: "ILS",
};

const TIMEZONE_TO_CURRENCY: Record<string, string> = {
  "Asia/Dhaka": "BDT",
  "Asia/Kolkata": "INR",
  "Asia/Karachi": "PKR",
  "Asia/Kathmandu": "NPR",
  "Asia/Colombo": "LKR",
  "Asia/Dubai": "AED",
  "Europe/London": "GBP",
  "America/New_York": "USD",
  "America/Chicago": "USD",
  "America/Denver": "USD",
  "America/Los_Angeles": "USD",
};

function getRegionFromLocale(locale: string) {
  const normalized = locale.replace("_", "-");
  const parts = normalized.split("-");
  const candidate = parts.length > 1 ? parts[parts.length - 1] : "";
  return candidate.toUpperCase();
}

export function getBrowserTimeZone() {
  if (typeof Intl !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  }
  return "";
}

export function detectCurrencyCode(locale: string, timeZone?: string) {
  if (timeZone && TIMEZONE_TO_CURRENCY[timeZone]) {
    return TIMEZONE_TO_CURRENCY[timeZone];
  }
  const region = getRegionFromLocale(locale);
  return REGION_TO_CURRENCY[region] ?? "USD";
}

export function getBrowserLocale() {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return "en-US";
}

export function formatCurrencyByLocale(
  value: number,
  locale: string,
  currency: string,
  maximumFractionDigits = 2,
) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits,
  }).format(safeValue);

  // Some locale/currency pairs still render code-style "BDT".
  // Force symbol-style fallback for Bangladesh Taka.
  if (currency === "BDT" && formatted.includes("BDT")) {
    return formatted.replace("BDT", "৳").trim();
  }

  return formatted;
}
