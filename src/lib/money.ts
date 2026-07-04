const gbpFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatMoney(pence: number) {
  return gbpFormatter.format(pence / 100);
}

export function formatSignedMoney(pence: number) {
  const absolute = formatMoney(Math.abs(pence));
  if (pence > 0) return `+${absolute}`;
  if (pence < 0) return `-${absolute}`;
  return absolute;
}

export function isValidPounds(value: string) {
  const normalized = normalizePounds(value);
  return /^\d+(\.\d{1,2})?$/.test(normalized);
}

export function parsePoundsToPence(value: string) {
  const normalized = normalizePounds(value);

  if (!isValidPounds(normalized)) {
    throw new Error("Enter a valid GBP amount with up to two decimals.");
  }

  const [pounds, pennies = ""] = normalized.split(".");
  const paddedPennies = pennies.padEnd(2, "0");

  return Number(pounds) * 100 + Number(paddedPennies);
}

export function penceToPoundsInput(pence: number) {
  return (pence / 100).toFixed(2);
}

function normalizePounds(value: string) {
  return value.replace(/[£,\s]/g, "").trim();
}
