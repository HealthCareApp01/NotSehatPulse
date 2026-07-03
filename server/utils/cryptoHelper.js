import CryptoJS from 'crypto-js';

const SALT = 'healthcare_e2ee_salt_key_9988';

const getSecretKey = (roomId) => {
  return `${SALT}_${roomId}`;
};

/**
 * Encrypts cleartext using AES-256 with a roomId-derived key.
 */
export const encryptMessage = (text, roomId) => {
  if (!text) return text;
  try {
    return CryptoJS.AES.encrypt(text, getSecretKey(roomId)).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return text;
  }
};

/**
 * Decrypts ciphertext using AES-256 with a roomId-derived key.
 */
export const decryptMessage = (ciphertext, roomId) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, getSecretKey(roomId));
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      // Fallback if decryption fails or if it's already plain text
      return ciphertext;
    }
    return decrypted;
  } catch (error) {
    return ciphertext;
  }
};
