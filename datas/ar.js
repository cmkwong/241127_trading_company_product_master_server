export const defaultArInvoices = {
  ar_invoices: [
    {
      id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30001',
      remark: 'Sample AR invoice',
      customer_id: 'fa42f9ab-d3f1-49d6-a8e1-7f26f7100001',
      customer_address_id: '84f2cf10-65d1-47f7-a60b-e30100010001',
      ari_shipping_details: [
        {
          id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30101',
          ar_invoice_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30001',
          sales_shipping_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0101',
          received: false,
          ari_shipping_files: [
            {
              id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30201',
              ari_shipping_detail_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30101',
              file_name: 'shipping-proof.pdf',
              file_url: '/public/ar/1/shipping-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'Shipping payment proof',
            },
          ],
        },
      ],
      ari_product_details: [
        {
          id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30301',
          ar_invoice_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30001',
          sales_product_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0401',
          received: false,
          ari_product_files: [
            {
              id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30401',
              ari_product_detail_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30301',
              file_name: 'product-proof.pdf',
              file_url: '/public/ar/1/product-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'Product payment proof',
            },
          ],
        },
      ],
      ari_service_details: [
        {
          id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30501',
          ar_invoice_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30001',
          sales_service_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0601',
          received: false,
          ari_service_files: [
            {
              id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30601',
              ari_service_detail_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30501',
              file_name: 'service-proof.pdf',
              file_url: '/public/ar/1/service-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'Service payment proof',
            },
          ],
        },
      ],
    },
    {
      id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30002',
      remark: 'Sample AR invoice - PetNest US',
      customer_id: 'fa42f9ab-d3f1-49d6-a8e1-7f26f7100002',
      customer_address_id: '84f2cf10-65d1-47f7-a60b-e30100020001',
      ari_shipping_details: [
        {
          id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c31101',
          ar_invoice_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30002',
          sales_shipping_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1101',
          received: false,
          ari_shipping_files: [
            {
              id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c31201',
              ari_shipping_detail_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c31101',
              file_name: 'shipping-proof-2.pdf',
              file_url: '/public/ar/2/shipping-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'Shipping payment proof',
            },
          ],
        },
      ],
      ari_product_details: [
        {
          id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c31301',
          ar_invoice_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30002',
          sales_product_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1401',
          received: false,
          ari_product_files: [
            {
              id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c31401',
              ari_product_detail_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c31301',
              file_name: 'product-proof-2.pdf',
              file_url: '/public/ar/2/product-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'Product payment proof',
            },
          ],
        },
      ],
      ari_service_details: [
        {
          id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c31501',
          ar_invoice_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30002',
          sales_service_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1601',
          received: false,
          ari_service_files: [
            {
              id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c31601',
              ari_service_detail_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c31501',
              file_name: 'service-proof-2.pdf',
              file_url: '/public/ar/2/service-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'Service payment proof',
            },
          ],
        },
      ],
    },
    {
      id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30003',
      remark: 'Sample AR invoice - NekoLife',
      customer_id: 'fa42f9ab-d3f1-49d6-a8e1-7f26f7100003',
      customer_address_id: '84f2cf10-65d1-47f7-a60b-e30100030001',
      ari_shipping_details: [
        {
          id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c32101',
          ar_invoice_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30003',
          sales_shipping_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2101',
          received: false,
          ari_shipping_files: [
            {
              id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c32201',
              ari_shipping_detail_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c32101',
              file_name: 'shipping-proof-3.pdf',
              file_url: '/public/ar/3/shipping-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'Shipping payment proof',
            },
          ],
        },
      ],
      ari_product_details: [
        {
          id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c32301',
          ar_invoice_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30003',
          sales_product_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2401',
          received: false,
          ari_product_files: [
            {
              id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c32401',
              ari_product_detail_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c32301',
              file_name: 'product-proof-3.pdf',
              file_url: '/public/ar/3/product-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'Product payment proof',
            },
          ],
        },
      ],
      ari_service_details: [
        {
          id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c32501',
          ar_invoice_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c30003',
          sales_service_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2601',
          received: false,
          ari_service_files: [
            {
              id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c32601',
              ari_service_detail_id: 'a3f13b62-2c81-4ab6-8f1f-87f7f4c32501',
              file_name: 'service-proof-3.pdf',
              file_url: '/public/ar/3/service-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'Service payment proof',
            },
          ],
        },
      ],
    },
  ],
};
