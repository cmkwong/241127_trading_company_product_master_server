import { default as axios } from 'axios';
import logger from './logger.js';

export const request = async (
  method = 'GET',
  url = '',
  params = {},
  data = {},
  token = ''
) => {
  try {
    const options = {
      method,
      url,
      data,
      params,
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const response = await axios(options);
    return response;
  } catch (err) {
    logger.error(`http error: ${err}`);
  }
};

export const parseStringToBoolean = (value) => {
  if (value === '1' || value === 'true' || value === 'yes') return true;
  else return false;
};
