export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = require("dns");
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    console.log("✓ DNS configured for MongoDB SRV resolution:", dns.getServers());
  }
}
