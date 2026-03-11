const axios = require("axios");
const https = require("https");


// -----------------------------
// 🔹 HTTPS Agent: Ignore self-signed certs for local LAN devices
// -----------------------------
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});


// -----------------------------
// 🔹 Token Cache: Per-IP storage
// -----------------------------
let pbxTokenCache = {}; // per IP cache


// -----------------------------
// 🔹 Login: POST /pbx/auth/login
// -----------------------------
async function pbxLogin(ip, username, password) {
  // Use HTTPS by default for PBX
  const url = `https://${ip}/pbx/auth/login`;
  console.log(`[PBX] Attempting login to: ${url}`);


  try {
    const response = await axios.post(url, { username, password }, {
      httpsAgent,
      timeout: 10000 // 10 seconds timeout
    });


    console.log(`[PBX] Login Response Status: ${response.status}`);


    // Extract token from nested data structure (PBX specific)
    // The API returns: { code: 0, message: "OK", data: "Bearer <token>" }
    let token = response?.data?.data || response?.data?.token || response?.data?.access_token;


    console.log(`[PBX] Raw token from server: ${token ? (typeof token === 'string' ? token.substring(0, 20) + '...' : 'object') : 'null'}`);


    // Remove "Bearer " prefix if present, as we add it manually in pbxApi
    if (token && typeof token === "string" && token.startsWith("Bearer ")) {
      token = token.replace("Bearer ", "");
    }


    if (token) {
      pbxTokenCache[ip] = token;
      console.log(`[PBX] Storage successful for ${ip}`);
      return { success: true, token };
    } else {
      console.error(`[PBX] Login failed: No token in response data`, response.data);
      return { success: false, error: "No token returned from server" };
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message;
    console.error(`[PBX] Login Error for ${ip}:`, errorMsg);


    // If https fails, it might be strictly http (though less likely for PBX)
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.warn(`[PBX] Connection refused on HTTPS, check if device uses HTTP instead.`);
    }


    return { success: false, error: errorMsg };
  }
}


// -----------------------------
// 🔹 Generic API fetcher
// -----------------------------
async function pbxApi(ip, token, endpoint) {
  const activeToken = token || pbxTokenCache[ip];
  if (!activeToken) {
    console.error(`[PBX] API Call Failed: Missing token for ${ip}`);
    throw new Error("PBX token missing — login first");
  }


  const url = `https://${ip}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
  console.log(`[PBX] Calling API: ${url}`);


  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${activeToken}` },
      httpsAgent,
      timeout: 10000
    });


    console.log(`[PBX] API Response [${endpoint}]: Success (Status ${response.status})`);
    return response.data;
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message;
    console.error(`[PBX] API Error [${endpoint}]:`, errorMsg);
    throw new Error(errorMsg);
  }
}


// endpoints
const pbxEndpoints = {
  common: [
    "/pbx/systeminfo/system-current-time",
    "/pbx/systeminfo/version",
    "/pbx/systeminfo/cpu",
    "/pbx/systeminfo/mem",
    "/pbx/systeminfo/disk",
    "/pbx/systeminfo/calls",
    "/pbx/systeminfo/extension-status",
    "/pbx/systeminfo/trunk-info",
  ],
  specific: {
    gateway: [],
  },
};


module.exports = {
  pbxLogin,
  pbxApi,
  pbxEndpoints,
};



