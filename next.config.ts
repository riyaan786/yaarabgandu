import type { NextConfig } from "next";

/** Google Search Console HTML-file verification (name must stay exactly this). */
const GOOGLE_VERIFICATION_FILE = "googledc0c2b1b335e05db.html";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // better-sqlite3 is a native module — keep it out of the bundler.
  serverExternalPackages: ["better-sqlite3"],
  async rewrites() {
    // The verification file must be reachable at the root of whatever URL prefix
    // the Search Console property was registered under. These are "afterFiles"
    // rewrites, so the real file in public/ still wins at the site root, while
    // nested paths (e.g. /yaarab-battery-and-tyre-works-fraser-town-bangalore/
    // googledc0c2b1b335e05db.html) also resolve.
    return [
      {
        source: `/:path*/${GOOGLE_VERIFICATION_FILE}`,
        destination: "/google-verification-file",
      },
    ];
  },
};

export default nextConfig;
