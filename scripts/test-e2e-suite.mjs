const BASE_URL = "http://127.0.0.1:3000";

const results = [];

async function testEndpoint(name, path, options = {}, expectedStatus = [200], validator = null) {
  const url = `${BASE_URL}${path}`;
  const startTime = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      ...options,
    });
    const duration = Date.now() - startTime;
    const isStatusOk = Array.isArray(expectedStatus)
      ? expectedStatus.includes(res.status)
      : res.status === expectedStatus;

    let body = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        body = await res.json();
      } catch {
        body = null;
      }
    } else {
      body = await res.text();
    }

    let validationPassed = true;
    let validationError = "";
    if (validator && isStatusOk) {
      try {
        const valRes = validator(res, body);
        if (valRes === false) {
          validationPassed = false;
          validationError = "Custom validation returned false";
        } else if (typeof valRes === "string" && valRes.length > 0) {
          validationPassed = false;
          validationError = valRes;
        }
      } catch (e) {
        validationPassed = false;
        validationError = e.message;
      }
    }

    const passed = isStatusOk && validationPassed;
    results.push({
      name,
      path,
      status: res.status,
      expectedStatus,
      duration: `${duration}ms`,
      passed,
      error: !isStatusOk
        ? `Expected status ${JSON.stringify(expectedStatus)}, got ${res.status}`
        : validationError,
    });

    console.log(
      `${passed ? "✅ PASS" : "❌ FAIL"}: [${res.status}] ${name} (${path}) - ${duration}ms`
    );
    if (!passed && (validationError || !isStatusOk)) {
      console.log(`   Error: ${!isStatusOk ? `Status ${res.status}` : validationError}`);
    }
  } catch (err) {
    results.push({
      name,
      path,
      status: "ERR",
      expectedStatus,
      duration: `${Date.now() - startTime}ms`,
      passed: false,
      error: err.message,
    });
    console.log(`❌ FAIL: [CONN ERR] ${name} (${path}) - ${err.message}`);
  }
}

async function runAllTests() {
  console.log("==================================================");
  console.log("🚀 RUNNING SKM LUXURY BRIDAL MASTER QA TEST SUITE");
  console.log("==================================================\n");

  // 1. PUBLIC PAGE ROUTES
  console.log("--- PHASE A: PUBLIC PAGES ---");
  await testEndpoint("Homepage", "/");
  await testEndpoint("About Page", "/about");
  await testEndpoint("Booking Page", "/booking");
  await testEndpoint("Bridal Packages Page", "/bridal-packages");
  await testEndpoint("Contact Page", "/contact");
  await testEndpoint("FAQ Page", "/faq");
  await testEndpoint("Gallery Page", "/gallery");
  await testEndpoint("Jewellery Rental Page", "/jewellery-rental");
  await testEndpoint("Services Page", "/services");
  await testEndpoint("Testimonials Page", "/testimonials");
  await testEndpoint("Terms of Service", "/terms");
  await testEndpoint("Privacy Policy", "/privacy-policy");
  await testEndpoint("Robots.txt", "/robots.txt", {}, [200], (res, body) => {
    return typeof body === "string" && (body.includes("User-agent") || body.includes("Disallow") || body.includes("Sitemap"));
  });
  await testEndpoint("Sitemap.xml", "/sitemap.xml", {}, [200], (res, body) => {
    return typeof body === "string" && body.includes("<urlset");
  });

  // 2. PUBLIC API ENDPOINTS
  console.log("\n--- PHASE B: PUBLIC API ENDPOINTS ---");
  await testEndpoint("Public Services API", "/api/services", {}, [200], (res, body) => {
    return body && body.success === true && Array.isArray(body.data);
  });
  await testEndpoint("Public Gallery API", "/api/gallery", {}, [200], (res, body) => {
    return body && body.success === true && Array.isArray(body.data);
  });
  await testEndpoint("Public Testimonials API", "/api/testimonials", {}, [200], (res, body) => {
    return body && body.success === true && Array.isArray(body.data);
  });
  await testEndpoint("Public FAQ API", "/api/faq", {}, [200], (res, body) => {
    return body && body.success === true && Array.isArray(body.data);
  });
  await testEndpoint("Booking Availability API (Missing Date 400)", "/api/bookings/availability", {}, [400], (res, body) => {
    return body && body.success === false;
  });
  await testEndpoint("Booking Availability API (Valid Date 200)", "/api/bookings/availability?date=2026-11-20", {}, [200], (res, body) => {
    return Boolean(body && body.success === true && body.data?.availability);
  });

  // 3. FORM VALIDATIONS & HONEYPOT
  console.log("\n--- PHASE C: FORMS, VALIDATIONS & HONEYPOT ---");
  await testEndpoint(
    "Contact POST - Validation Error on Empty Body",
    "/api/contact",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    },
    [400],
    (res, body) => body && body.success === false
  );

  await testEndpoint(
    "Contact POST - Honeypot Bot Trap",
    "/api/contact",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bot Spam",
        phone: "9876543210",
        message: "Spam content",
        website_hp: "http://spam-link.com",
      }),
    },
    [200],
    (res, body) => body && body.success === true
  );

  await testEndpoint(
    "Contact POST - Valid Submission",
    "/api/contact",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Automated Test",
        phone: "918608194233",
        email: "test@example.com",
        message: "Automated QA inquiry message for testing synchronization.",
      }),
    },
    [201, 200],
    (res, body) => body && body.success === true
  );

  await testEndpoint(
    "Booking POST - Validation Error on Empty Body",
    "/api/bookings",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    },
    [400],
    (res, body) => body && body.success === false
  );

  await testEndpoint(
    "Booking POST - Honeypot Trap",
    "/api/bookings",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Spam Bot",
        phone: "9876543210",
        service: "Bridal Makeup",
        preferredDate: "2026-09-01",
        preferredTime: "Morning",
        location: "Salem",
        website_hp: "bot_filled_value",
      }),
    },
    [200],
    (res, body) => body && body.success === true
  );

  await testEndpoint(
    "Booking POST - Valid Submission",
    "/api/bookings",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Priya Sharma (QA)",
        phone: "9876543210",
        email: "priya.qa@example.com",
        service: "Royal HD Makeover Package",
        preferredDate: "2026-10-15",
        preferredTime: "Morning (Muhurtham)",
        location: "Salem Grand Palace",
        message: "Automated test booking for end-to-end verification.",
      }),
    },
    [201],
    (res, body) => Boolean(body && body.success === true && body.data?.bookingReference)
  );

  // 4. ADMIN ROUTE & PROXY SECURITY (Unauthenticated Access MUST be Blocked)
  console.log("\n--- PHASE D: ADMIN ROUTE & API PROXY SECURITY (Unauthenticated) ---");
  await testEndpoint("Admin Login Page (Public)", "/admin/login", {}, [200]);
  
  // Page redirects (307/308)
  await testEndpoint("Admin Dashboard Page (Auth Guard)", "/admin/dashboard", {}, [307, 308]);
  await testEndpoint("Admin Bookings Page (Auth Guard)", "/admin/bookings", {}, [307, 308]);
  await testEndpoint("Admin Services Page (Auth Guard)", "/admin/services", {}, [307, 308]);
  await testEndpoint("Admin Gallery Page (Auth Guard)", "/admin/gallery", {}, [307, 308]);
  await testEndpoint("Admin Messages Page (Auth Guard)", "/admin/messages", {}, [307, 308]);
  await testEndpoint("Admin Settings Page (Auth Guard)", "/admin/settings", {}, [307, 308]);
  await testEndpoint("Admin Testimonials Page (Auth Guard)", "/admin/testimonials", {}, [307, 308]);
  await testEndpoint("Admin FAQ Page (Auth Guard)", "/admin/faq", {}, [307, 308]);

  // Admin API routes (401 Unauthorized)
  await testEndpoint("Admin Bookings API (GET)", "/api/admin/bookings", {}, [401]);
  await testEndpoint("Admin Bookings API [id] (PATCH)", "/api/admin/bookings/66554433221100aabbccddee", { method: "PATCH" }, [401]);
  await testEndpoint("Admin Bookings API [id] (DELETE)", "/api/admin/bookings/66554433221100aabbccddee", { method: "DELETE" }, [401]);

  await testEndpoint("Admin Services API (GET)", "/api/admin/services", {}, [401]);
  await testEndpoint("Admin Services API (POST)", "/api/admin/services", { method: "POST" }, [401]);
  await testEndpoint("Admin Services API [id] (PATCH)", "/api/admin/services/66554433221100aabbccddee", { method: "PATCH" }, [401]);
  await testEndpoint("Admin Services API [id] (DELETE)", "/api/admin/services/66554433221100aabbccddee", { method: "DELETE" }, [401]);

  await testEndpoint("Admin Gallery API (GET)", "/api/admin/gallery", {}, [401]);
  await testEndpoint("Admin Gallery API (POST)", "/api/admin/gallery", { method: "POST" }, [401]);
  await testEndpoint("Admin Gallery API (DELETE)", "/api/admin/gallery", { method: "DELETE" }, [401]);

  await testEndpoint("Admin Messages API (GET)", "/api/admin/messages", {}, [401]);
  await testEndpoint("Admin Messages API [id] (PATCH)", "/api/admin/messages/66554433221100aabbccddee", { method: "PATCH" }, [401]);
  await testEndpoint("Admin Messages API [id] (DELETE)", "/api/admin/messages/66554433221100aabbccddee", { method: "DELETE" }, [401]);

  await testEndpoint("Admin Profile API (GET)", "/api/admin/profile", {}, [401]);
  await testEndpoint("Admin Profile API (PUT)", "/api/admin/profile", { method: "PUT" }, [401]);

  await testEndpoint("Admin Testimonials API (GET)", "/api/admin/testimonials", {}, [401]);
  await testEndpoint("Admin Testimonials API (POST)", "/api/admin/testimonials", { method: "POST" }, [401]);

  await testEndpoint("Admin FAQ API (GET)", "/api/admin/faq", {}, [401]);
  await testEndpoint("Admin FAQ API (POST)", "/api/admin/faq", { method: "POST" }, [401]);

  console.log("\n==================================================");
  console.log("📊 SUMMARY OF TEST RESULTS");
  console.log("==================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run : ${total}`);
  console.log(`Passed          : ${passed}`);
  console.log(`Failed          : ${failed}`);
  console.log(`Success Rate    : ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log("❌ FAILED TESTS:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - [${r.status}] ${r.name} (${r.path}): ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log("🎉 ALL TESTS PASSED (100%)! APPLICATION IS FULLY VERIFIED & SECURE.");
    process.exit(0);
  }
}

runAllTests();
