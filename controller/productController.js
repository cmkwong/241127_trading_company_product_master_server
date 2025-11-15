import TopClient from 'node-taobao-topclient';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

export const postProduct = catchAsync(async (req, res, next) => {
  const client = new TopClient({
    appkey: 'appkey',
    appsecret: 'secret',
    REST_URL: 'http://gw.api.taobao.com/router/rest',
  });

  client.execute(
    'alibaba.icbu.open.product.post',
    {
      param_product_post: {
        group_id: '',
        keywords: [],
        subject: '',
        category_id: [],
        product_trade: {
          money_type: 125,
        },
      },
    },
    (error, response) => {
      if (!error) {
        console.log(response);
        res.prints = {
          status: 'success',
        };
        next();
      } else {
        logger.error(error);
        next(error);
      }
    }
  );
});

export default postProduct;
