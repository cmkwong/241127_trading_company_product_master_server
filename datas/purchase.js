export const defaultPurchaseRequests = {
  purchase_requests: [
    {
      id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10001',
      to_order: false,
      remark: 'Sample purchase request',
      supplier_id: '9a1d4f2b-31b0-4d22-a04b-2d6fdb220001',
      supplier_address_id: 'f3a2d17c-51bc-47d4-9df0-7fd7ea110001',
      purchase_shipping_details: [
        {
          id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10101',
          purchase_request_id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10001',
          supplier_address_id: 'f3a2d17c-51bc-47d4-9df0-7fd7ea110001',
          length: 50,
          width: 30,
          height: 25,
          quantity: 20,
          weight: 18,
          details: 'Sample inbound shipping',
          purchase_shipping_images: [
            {
              id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10201',
              purchase_shipping_detail_id:
                'e7d7b236-6c3d-4325-9f49-5e6acfe10101',
              image_url: '/public/purchase/1/shipping-1.jpg',
              image_name: 'shipping-1.jpg',
              display_order: 1,
            },
          ],
        },
      ],
      purchase_product_details: [
        {
          id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10301',
          purchase_request_id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10001',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          qty: 200,
          currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a01',
          price: 2.1,
          details: 'Bulk product purchase',
          purchase_product_images: [
            {
              id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10401',
              purchase_product_detail_id:
                'e7d7b236-6c3d-4325-9f49-5e6acfe10301',
              image_url: '/public/purchase/1/product-1.jpg',
              image_name: 'product-1.jpg',
              display_order: 1,
            },
          ],
        },
      ],
      purchase_service_details: [
        {
          id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10501',
          purchase_request_id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10001',
          supplier_id: '9a1d4f2b-31b0-4d22-a04b-2d6fdb220001',
          service_id: '5d3ec7a2-6eb6-40d8-9f7f-c3b8c0aa2006',
          qty: 1,
          currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a01',
          price: 180,
          details: 'Packaging production service',
          purchase_service_images: [
            {
              id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10601',
              purchase_service_detail_id:
                'e7d7b236-6c3d-4325-9f49-5e6acfe10501',
              image_url: '/public/purchase/1/service-1.jpg',
              image_name: 'service-1.jpg',
              display_order: 1,
            },
          ],
        },
      ],
    },
  ],
};
