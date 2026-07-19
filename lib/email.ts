/** Sends the OTP via MSG91's v5 template-email API. The exact request shape
 * couldn't be confirmed against MSG91's live docs (their reference site is
 * client-rendered and not scrapable) — this follows their documented v5
 * template pattern. If sends start failing, log the response body from the
 * catch below first; that's MSG91 telling us what's actually wrong.
 *
 * Requires an email template created in the MSG91 dashboard containing a
 * variable named to match OTP_VARIABLE_NAME (default "OTP") — update that
 * constant if your template uses a different variable name. */
const OTP_VARIABLE_NAME = "OTP";

type SendResult = { ok: true } | { ok: false; error: string };

export async function sendOtpEmail(to: string, code: string): Promise<SendResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const domain = process.env.MSG91_EMAIL_DOMAIN;
  const templateId = process.env.MSG91_EMAIL_TEMPLATE_ID;
  const fromEmail = process.env.MSG91_FROM_EMAIL;

  if (!authKey || !domain || !templateId || !fromEmail) {
    // No MSG91 credentials configured — dev/local fallback so the rest of
    // the login flow is testable without a real account. The code goes to
    // the server log instead of an inbox.
    console.log(`[otp] MSG91 not configured — login code for ${to} is ${code}`);
    return { ok: true };
  }

  try {
    const res = await fetch("https://control.msg91.com/api/v5/email/send", {
      method: "POST",
      headers: { authkey: authKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        recipients: [
          {
            to: [{ email: to }],
            variables: { [OTP_VARIABLE_NAME]: code },
          },
        ],
        from: { email: fromEmail, name: process.env.MSG91_FROM_NAME || "Letterbox" },
        domain,
        template_id: templateId,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[otp] MSG91 send failed", res.status, body);
      return { ok: false, error: "Couldn't send the code — try again?" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[otp] MSG91 send threw", err);
    return { ok: false, error: "Couldn't send the code — try again?" };
  }
}
