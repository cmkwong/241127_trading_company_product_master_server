export const defaultApInvoices = {
  ap_invoices: [
    {
      id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440001',
      remark: 'Sample AP invoice',
      supplier_id: '9a1d4f2b-31b0-4d22-a04b-2d6fdb220001',
      supplier_address_id: 'f3a2d17c-51bc-47d4-9df0-7fd7ea110001',
      api_shipping_details: [
        {
          id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440101',
          ap_invoice_id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440001',
          purchase_shipping_detail_id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10101',
          paid: false,
          api_shipping_files: [
            {
              id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440201',
              api_shipping_detail_id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440101',
              file_name: 'ap-shipping-proof.pdf',
              file_url: '/public/ap/1/shipping-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'AP shipping payment proof',
            },
          ],
        },
      ],
      api_product_details: [
        {
          id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440301',
          ap_invoice_id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440001',
          purchase_product_detail_id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10301',
          paid: false,
          api_product_files: [
            {
              id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440401',
              api_product_detail_id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440301',
              file_name: 'ap-product-proof.pdf',
              file_url: '/public/ap/1/product-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'AP product payment proof',
            },
          ],
        },
      ],
      api_service_details: [
        {
          id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440501',
          ap_invoice_id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440001',
          purchase_service_detail_id: 'e7d7b236-6c3d-4325-9f49-5e6acfe10501',
          paid: false,
          api_service_files: [
            {
              id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440601',
              api_service_detail_id: 'c6d97f88-2b6f-4fdf-b8ad-241bcf440501',
              file_name: 'ap-service-proof.pdf',
              file_url: '/public/ap/1/service-proof.pdf',
              display_order: 1,
              file_type: 'pdf',
              description: 'AP service payment proof',
            },
          ],
        },
      ],
    },
  ],
};
