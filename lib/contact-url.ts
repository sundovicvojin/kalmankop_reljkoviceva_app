const DEFAULT_CONTACT_URL = "https://kalmankop.rs/kontakt";

export function getContactUrl() {
  const contactUrl = process.env.NEXT_PUBLIC_CONTACT_URL ?? DEFAULT_CONTACT_URL;

  if (/^https?:\/\//i.test(contactUrl)) {
    return contactUrl;
  }

  return `https://${contactUrl.replace(/^\/+/, "")}`;
}
