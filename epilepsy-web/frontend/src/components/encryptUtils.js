// encryptUtils.js
// simple AES-GCM encryption helpers

// Convert Uint8Array to Base64
export const toBase64 = (arr) =>
  window.btoa(String.fromCharCode(...new Uint8Array(arr)));

// Convert Base64 to Uint8Array
export const fromBase64 = (b64) =>
  Uint8Array.from(window.atob(b64), (c) => c.charCodeAt(0));

// Generate an AES-GCM key (random)
export async function generateAESKey() {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt data
export async function encryptData(key, data) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // random IV
  const encryptedArray = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return {
    iv: toBase64(iv),
    ciphertext: toBase64(encryptedArray),
  };
}

// Export raw key to Base64
export async function exportKey(key) {
  const raw = await crypto.subtle.exportKey("raw", key);
  return toBase64(raw);
}

// Import key from Base64
export async function importKey(b64key) {
  const raw = fromBase64(b64key);
  return crypto.subtle.importKey(
    "raw",
    raw,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}