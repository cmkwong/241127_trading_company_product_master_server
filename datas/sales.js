export const defaultSalesQuotations = {
  sales_quotations: [
    {
      id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0001',
      to_order: false,
      remark: 'Sample sales quotation',
      customer_id: 'fa42f9ab-d3f1-49d6-a8e1-7f26f7100001',
      customer_address_id: '84f2cf10-65d1-47f7-a60b-e30100010001',
      sales_shipping_details: [
        {
          id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0101',
          sales_quotation_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0001',
          customer_address_id: '84f2cf10-65d1-47f7-a60b-e30100010001',
          length: 42.5,
          width: 30.0,
          height: 21.0,
          qty: 10,
          weight: 12.5,
          details: 'Main shipment dimensions',
          sales_shipping_prices: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0201',
              sales_shipping_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0101',
              supplier_id: '9a1d4f2b-31b0-4d22-a04b-2d6fdb220001',
              incoterms: 'FOB',
              currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a01',
              price: 120.5,
              details: 'FOB Shenzhen',
              selected: true,
            },
          ],
          sales_shipping_images: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0301',
              sales_shipping_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0101',
              image_url: '/public/sales/quotation-1/shipping-1.jpg',
              image_name: 'shipping-1.jpg',
              display_order: 1,
            },
          ],
        },
      ],
      sales_product_details: [
        {
          id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0401',
          sales_quotation_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0001',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          qty: 100,
          currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a01',
          price: 3.2,
          details: 'Sample product detail line',
          sales_product_detail_image_selections: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0501',
              sales_product_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0401',
              image_id: '550e8400-e29b-41d4-a716-446655440204',
            },
          ],
        },
      ],
      sales_service_details: [
        {
          id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0601',
          sales_quotation_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0001',
          supplier_id: '9a1d4f2b-31b0-4d22-a04b-2d6fdb220001',
          service_id: '5d3ec7a2-6eb6-40d8-9f7f-c3b8c0aa2005',
          qty: 1,
          currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a01',
          price: 80,
          details: 'Packaging design service',
          sales_service_detail_image_selections: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0701',
              sales_service_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0601',
              image_id: 'c4ddaf7b-8a24-4e4b-9c8f-ec7a96ab0001',
            },
          ],
        },
      ],
    },
    {
      id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0002',
      to_order: false,
      remark: 'Sample sales quotation - PetNest US',
      customer_id: 'fa42f9ab-d3f1-49d6-a8e1-7f26f7100002',
      customer_address_id: '84f2cf10-65d1-47f7-a60b-e30100020001',
      sales_shipping_details: [
        {
          id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1101',
          sales_quotation_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0002',
          customer_address_id: '84f2cf10-65d1-47f7-a60b-e30100020001',
          length: 48.0,
          width: 35.0,
          height: 24.0,
          qty: 20,
          weight: 20.8,
          details: 'US retail replenishment shipment',
          sales_shipping_prices: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1201',
              sales_shipping_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1101',
              supplier_id: '9a1d4f2b-31b0-4d22-a04b-2d6fdb220002',
              incoterms: 'EXW',
              currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a01',
              price: 198.75,
              details: 'EXW Shenzhen to Miami forwarder',
              selected: true,
            },
          ],
          sales_shipping_images: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1301',
              sales_shipping_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1101',
              image_url: '/public/sales/quotation-2/shipping-1.jpg',
              image_name: 'shipping-2-1.jpg',
              display_order: 1,
            },
          ],
        },
      ],
      sales_product_details: [
        {
          id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1401',
          sales_quotation_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0002',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          qty: 200,
          currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a01',
          price: 4.65,
          details: 'Bottle line for retail chain promotion',
          sales_product_detail_image_selections: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1501',
              sales_product_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1401',
              image_id: '1133f693-3a10-47ac-9faa-5fa98d16f744',
            },
          ],
        },
      ],
      sales_service_details: [
        {
          id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1601',
          sales_quotation_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0002',
          supplier_id: '9a1d4f2b-31b0-4d22-a04b-2d6fdb220002',
          service_id: '5d3ec7a2-6eb6-40d8-9f7f-c3b8c0aa2009',
          qty: 1,
          currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a01',
          price: 95,
          details: 'Final packing and sub-assembly service',
          sales_service_detail_image_selections: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1701',
              sales_service_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f1601',
              image_id: 'c4ddaf7b-8a24-4e4b-9c8f-ec7a96ab0003',
            },
          ],
        },
      ],
    },
    {
      id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0003',
      to_order: true,
      remark: 'Sample sales quotation - NekoLife',
      customer_id: 'fa42f9ab-d3f1-49d6-a8e1-7f26f7100003',
      customer_address_id: '84f2cf10-65d1-47f7-a60b-e30100030001',
      sales_shipping_details: [
        {
          id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2101',
          sales_quotation_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0003',
          customer_address_id: '84f2cf10-65d1-47f7-a60b-e30100030001',
          length: 40.0,
          width: 28.0,
          height: 20.0,
          qty: 12,
          weight: 10.4,
          details: 'Private label first production run',
          sales_shipping_prices: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2201',
              sales_shipping_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2101',
              supplier_id: '9a1d4f2b-31b0-4d22-a04b-2d6fdb220001',
              incoterms: 'FOB',
              currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a03',
              price: 1320,
              details: 'FOB Ningbo consolidation',
              selected: true,
            },
          ],
          sales_shipping_images: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2301',
              sales_shipping_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2101',
              image_url: '/public/sales/quotation-3/shipping-1.jpg',
              image_name: 'shipping-3-1.jpg',
              display_order: 1,
            },
          ],
        },
      ],
      sales_product_details: [
        {
          id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2401',
          sales_quotation_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0003',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          qty: 300,
          currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a03',
          price: 22.8,
          details: 'Private label feeder batch',
          sales_product_detail_image_selections: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2501',
              sales_product_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2401',
              image_id: '7b3acbcf-d7ec-4faa-b1c6-815f2bd30faa',
            },
          ],
        },
      ],
      sales_service_details: [
        {
          id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2601',
          sales_quotation_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f0003',
          supplier_id: '9a1d4f2b-31b0-4d22-a04b-2d6fdb220003',
          service_id: '5d3ec7a2-6eb6-40d8-9f7f-c3b8c0aa200f',
          qty: 1,
          currency_id: 'c4f51187-4f42-4a83-8cb1-4d8b8ce95a03',
          price: 680,
          details: 'Compliance and export docs package',
          sales_service_detail_image_selections: [
            {
              id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2701',
              sales_service_detail_id: 'b5018ca1-8ac3-4e41-9fdb-a9e4102f2601',
              image_id: 'c4ddaf7b-8a24-4e4b-9c8f-ec7a96ab0004',
            },
          ],
        },
      ],
    },
  ],
};
