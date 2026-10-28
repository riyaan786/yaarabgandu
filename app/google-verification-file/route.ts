/**
 * Serves the Google Search Console verification file content.
 *
 * Exposed at /google-verification-file and rewritten from any nested path that
 * ends in the verification filename, so the token verifies whether the property
 * is a domain property or a URL-prefix property with a path.
 *
 * The response is exactly the 53 characters Google expects — no newline, no
 * wrapper, no HTML tags — otherwise Search Console reports "wrong content".
 */
const FILE_NAME = "googledc0c2b1b335e05db.html";
const BODY = `google-site-verification: ${FILE_NAME}`;

export function GET() {
  return new Response(BODY, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Content-Length": String(Buffer.byteLength(BODY, "utf8")),
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}