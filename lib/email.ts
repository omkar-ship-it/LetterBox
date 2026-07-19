type SendResult = { ok: true } | { ok: false; error: string };

/** Shared MSG91 v5 template-email sender — both the OTP code and the
 * "you've received a letter" notification go through this. Confirmed
 * working against a live MSG91 account (request shape accepted on the
 * first real try for the OTP template — only the `from` domain and the
 * variable name needed correcting that time). Falls back to logging
 * instead of sending whenever the relevant template isn't configured, so
 * every flow that sends email stays testable without real credentials. */
async function sendMsg91TemplateEmail(opts: {
  to: string;
  templateId: string | undefined;
  variables: Record<string, string>;
  logLabel: string;
  devFallbackMessage: string;
}): Promise<SendResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const domain = process.env.MSG91_EMAIL_DOMAIN;
  const fromEmail = process.env.MSG91_FROM_EMAIL;

  if (!authKey || !domain || !opts.templateId || !fromEmail) {
    console.log(`[${opts.logLabel}] MSG91 not configured — ${opts.devFallbackMessage}`);
    return { ok: true };
  }

  try {
    const res = await fetch("https://control.msg91.com/api/v5/email/send", {
      method: "POST",
      headers: { authkey: authKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        recipients: [{ to: [{ email: opts.to }], variables: opts.variables }],
        from: { email: fromEmail, name: process.env.MSG91_FROM_NAME || "Letterbox" },
        domain,
        template_id: opts.templateId,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[${opts.logLabel}] MSG91 send failed`, res.status, body);
      return { ok: false, error: "Couldn't send the email — try again?" };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[${opts.logLabel}] MSG91 send threw`, err);
    return { ok: false, error: "Couldn't send the email — try again?" };
  }
}

// The `letterbox_otp` template's placeholder is `{{OTP_CODE}}`, not
// `{{OTP}}` — keep this in sync with whatever the template actually uses.
export async function sendOtpEmail(to: string, code: string): Promise<SendResult> {
  return sendMsg91TemplateEmail({
    to,
    templateId: process.env.MSG91_EMAIL_TEMPLATE_ID,
    variables: { OTP_CODE: code },
    logLabel: "otp",
    devFallbackMessage: `login code for ${to} is ${code}`,
  });
}

/** Sent once, at publish time, to each email address the sender optionally
 * added — a delivery mechanism alongside (not instead of) the copy-link
 * flow. Needs its own MSG91 template (MSG91_LETTER_TEMPLATE_ID) distinct
 * from the OTP one — different content, different variables. Confirm the
 * exact variable names against the real template before assuming these
 * three ({{SENDER_NAME}}, {{RECIPIENT_NAME}}, {{LETTER_URL}}) are right;
 * they're a reasonable guess, not verified against a live template yet. */
export async function sendLetterNotificationEmail(
  to: string,
  opts: { senderName: string; recipientName: string; letterUrl: string }
): Promise<SendResult> {
  return sendMsg91TemplateEmail({
    to,
    templateId: process.env.MSG91_LETTER_TEMPLATE_ID,
    variables: {
      SENDER_NAME: opts.senderName,
      RECIPIENT_NAME: opts.recipientName,
      LETTER_URL: opts.letterUrl,
    },
    logLabel: "letter",
    devFallbackMessage: `would email ${to} — "${opts.senderName} sent ${opts.recipientName} a letter" -> ${opts.letterUrl}`,
  });
}
