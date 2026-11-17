/*
 * KLN Towing — online request form settings.
 * "endpoint" is the KLN Dispatch address that receives online requests.
 * If it is ever left empty, visitors see a "call us" message instead of the form.
 */
window.KLN_TOW_CONFIG = window.KLN_TOW_CONFIG || {
  endpoint: "https://kln-dispatch.pages.dev/api/public/tow-request",
};
