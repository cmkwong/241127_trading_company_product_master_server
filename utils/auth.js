import NodeRSA from 'node-rsa';
import axios from 'axios';
import logger from '../utils/logger.js';

// check if websupervisor token expired
export const checkSsmeTokenExpired = () => {
  if (
    (new Date().getTime() - global.ssmeTokenDatetime) / (24 * 60 * 60 * 1000) >
    5
  ) {
    logger.info('token expired, getting the token now');
    return true;
  }
  return false;
};

// encrypt text with public key
export const encryptText = (text, publicKey) => {
  const publicRsaKey = new NodeRSA(
    '-----BEGIN PUBLIC KEY-----' + publicKey + '-----END PUBLIC KEY-----',
    { encryptionScheme: 'pkcs1' }
  );
  const encryptedString = publicRsaKey.encrypt(text, 'base64');
  return encryptedString;
};

export const getErpToken = async (text, publicKey) => {
  const ciphertext = encryptText(text, publicKey);
  // logger.info(`ciphertext: ${ciphertext}`);

  // sending POST request to ERP server
  const erpResponse = await axios.post(
    'http://192.168.2.31:8080/test/GetToken',
    {
      SecretKey: ciphertext,
    }
  );
  // logger.info(ciphertext);
  return erpResponse.data;
};
