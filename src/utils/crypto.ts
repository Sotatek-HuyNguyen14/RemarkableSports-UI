import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import { Platform } from "react-native";
import store from "../stores";
import { createRandomString } from "./strings";

const CRYPTO_KEY = "cryptoKey";
export const DEVICE_OS = Platform.OS;

export interface biometricalStorageModel {
  username: string | undefined;
  password: string | undefined;
  biometricalType: string | undefined;
}

export const BIOMETRIC_TYPE = {
  TouchID: "TouchID",
  FaceID: "FaceID",
  FacialRecognition: "FacialRecognition",
  Fingerprint: "Fingerprint",
  IRIS: "IRIS",
};

const aesEncrypt = (pas: string) => {
  // Key transformation wordArray
  // const storKey = await AsyncStorage.getItem(CRYPTO_KEY);

  if (store.storKey) {
    const Utf8Key = CryptoJS.enc.Utf8.parse(JSON.parse(store.storKey));
    /**
     * CipherOption, option:
     *   mode: model,  (CBC, CFB, CTR, CTRGladman, OFB, ECB),   CryptoJS.mode
     *   padding:  ,  (Pkcs7, AnsiX923, Iso10126, Iso97971, ZeroPadding, NoPadding),
     *        CryptoJS.pad
     *   iv:  , mode === ECB  ,   iv
     */
    const cipher = CryptoJS.AES.encrypt(pas, Utf8Key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
      iv: "",
    });
    // ase64
    const base64Cipher = cipher.ciphertext.toString(CryptoJS.enc.Base64);
    return base64Cipher;
  }
};
const aesDecrypt = (pas: string) => {
  // const storKey = await AsyncStorage.getItem(CRYPTO_KEY);

  if (store.storKey) {
    const Utf8Key = CryptoJS.enc.Utf8.parse(JSON.parse(store.storKey));

    const decipher = CryptoJS.AES.decrypt(pas, Utf8Key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    const resultDecipher = CryptoJS.enc.Utf8.stringify(decipher);
    return resultDecipher;
  }
};

const saveAccountStorage = async (
  username: string,
  password: string,
  biometricalType: string
) => {
  const cryptUsername = aesEncrypt(username);
  const cryptPassword = aesEncrypt(password);

  await AsyncStorage.setItem(
    DEVICE_OS,
    JSON.stringify({
      username: cryptUsername,
      password: cryptPassword,
      biometricalType,
    })
  );
};

const saveAccountStore = (
  username: string,
  password: string,
  biometricalType: string
) => {
  const cryptUsername = aesEncrypt(username);
  const cryptPassword = aesEncrypt(password);

  store.setBiometricalType(biometricalType);
  store.setUsername(cryptUsername);
  store.setPassword(cryptPassword);
};

const getAccountStorage = async () => {
  const account = await AsyncStorage.getItem(DEVICE_OS);
  if (account) {
    const localAccount = JSON.parse(account);
    store.setUsername(localAccount.username);
    store.setPassword(localAccount.password);
    store.setBiometricalType(localAccount.biometricalType);
  }
};

const checkandCreatCryptoKey = async () => {
  const storKey = await AsyncStorage.getItem(CRYPTO_KEY);
  if (!storKey) {
    const createStr = createRandomString(16);
    await AsyncStorage.setItem(CRYPTO_KEY, JSON.stringify(createStr));
    store.setStorKey(createStr);
  }
  if (storKey) {
    store.setStorKey(storKey);
  }
};

export {
  aesEncrypt,
  aesDecrypt,
  checkandCreatCryptoKey,
  saveAccountStorage,
  getAccountStorage,
  saveAccountStore,
};
