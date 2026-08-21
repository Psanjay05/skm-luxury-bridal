const BASE_URL = "http://127.0.0.1:3000";

async function testLogin(username, password) {
  console.log(`\nTesting login with username="${username}", password="${password}"...`);
  
  // 1. Fetch CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const cookie = csrfRes.headers.get("set-cookie");

  console.log(`Retrieved CSRF token: ${csrfToken ? "YES" : "NO"}`);

  // 2. Submit credentials
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie || "",
    },
    body: new URLSearchParams({
      csrfToken,
      username,
      password,
      redirect: "false",
      json: "true",
    }),
    redirect: "manual",
  });

  console.log(`Response Status: ${loginRes.status}`);
  const setCookie = loginRes.headers.get("set-cookie");
  console.log(`Session Cookie Received: ${setCookie ? "YES (Authenticated ✅)" : "NO (Failed ❌)"}`);

  const location = loginRes.headers.get("location") || "";
  const isRedirectToDashboard = location.includes("/admin/dashboard") || location === "/admin/dashboard" || location.endsWith("/admin/dashboard");
  const isErrorRedirect = location.includes("error=");
  
  const success = (setCookie && isRedirectToDashboard) || (!isErrorRedirect && setCookie);
  console.log(`Redirect Location: ${location}`);
  console.log(`Result: ${success ? "✅ LOGIN SUCCESSFUL" : "❌ LOGIN FAILED (Invalid credentials)"}`);
  return success;
}

async function run() {
  console.log("==========================================");
  console.log("🔑 TESTING ADMIN LOGIN AUTHENTICATION");
  console.log("==========================================");

  // Test with requested credentials
  await testLogin("Maha", "Maha123@.1#");
  await testLogin("maha", "Maha123@.1#");
  await testLogin("admin", "LuxuryBridal@2026");
  await testLogin("Maha", "wrongpassword");
}

run();
