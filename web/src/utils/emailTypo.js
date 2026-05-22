const TYPO_MAP = {
  // gmail
  'gmil.com':   'gmail.com', 'gmial.com':  'gmail.com', 'gmal.com':   'gmail.com',
  'gamil.com':  'gmail.com', 'gnail.com':  'gmail.com', 'gmaill.com': 'gmail.com',
  'gmail.co':   'gmail.com', 'gmail.cm':   'gmail.com', 'gmail.con':  'gmail.com',
  'gmail.cmo':  'gmail.com', 'gmail.ocm':  'gmail.com', 'gmaio.com':  'gmail.com',
  // yahoo
  'yaho.com':   'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.co':   'yahoo.com',
  'yaho.co.uk': 'yahoo.co.uk', 'yhoo.com': 'yahoo.com',
  // hotmail
  'hotmial.com':  'hotmail.com', 'hotmal.com': 'hotmail.com',
  'hotmail.co':   'hotmail.com', 'hotmaill.com': 'hotmail.com',
  'hormail.com':  'hotmail.com',
  // outlook
  'outlok.com':  'outlook.com', 'outllok.com': 'outlook.com',
  'outlook.co':  'outlook.com', 'otulook.com': 'outlook.com',
  // icloud
  'iclould.com': 'icloud.com', 'icould.com': 'icloud.com',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function isValidEmailFormat(email) {
  return EMAIL_RE.test(email.trim());
}

export function suggestEmailFix(email) {
  const at = email.lastIndexOf('@');
  if (at === -1) return null;
  const domain = email.slice(at + 1).toLowerCase();
  const fix = TYPO_MAP[domain];
  if (!fix) return null;
  return email.slice(0, at + 1) + fix;
}
