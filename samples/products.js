// Sample product data based on TABLE_MASTER schema
const sampleProducts = {
  // Main products
  products: [
    {
      id: 'e7c8f8f0-1d8a-4d3c-9f3e-3b5e2e8a1d6c',
      product_id: 'PRD-001',
      icon_url: 'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
      remark: 'Premium quality product with multiple customization options',
      created_at: '2025-10-15T10:30:00Z',
      updated_at: '2025-11-20T14:45:00Z',
    },
    {
      id: 'a2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7',
      product_id: 'PRD-002',
      icon_url: 'public/products/202511201324/Alibaba 1688/display/Main_03.jpg',
      remark: 'Eco-friendly material, suitable for outdoor use',
      created_at: '2025-09-22T08:15:00Z',
      updated_at: '2025-11-18T09:20:00Z',
    },
    {
      id: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6',
      product_id: 'PRD-003',
      icon_url: 'public/products/202511201324/Alibaba 1688/display/Main_06.jpg',
      remark: 'Limited edition design with premium finish',
      created_at: '2025-11-01T16:40:00Z',
      updated_at: '2025-11-21T11:30:00Z',
    },
  ],

  // Relationship data
  product_names: [
    {
      id: 1,
      product_id: 'e7c8f8f0-1d8a-4d3c-9f3e-3b5e2e8a1d6c',
      name: 'Decorative Ceramic Vase',
      name_type_id: 1,
    },
    {
      id: 2,
      product_id: 'e7c8f8f0-1d8a-4d3c-9f3e-3b5e2e8a1d6c',
      name: '装饰陶瓷花瓶',
      name_type_id: 2,
    },
    {
      id: 3,
      product_id: 'a2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7',
      name: 'Bamboo Cutting Board',
      name_type_id: 1,
    },
    {
      id: 4,
      product_id: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6',
      name: 'Solar Garden Light',
      name_type_id: 1,
    },
  ],

  product_categories: [
    {
      product_id: 'e7c8f8f0-1d8a-4d3c-9f3e-3b5e2e8a1d6c',
      category_id: 1,
    },
    {
      product_id: 'a2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7',
      category_id: 2,
    },
    {
      product_id: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6',
      category_id: 3,
    },
    {
      product_id: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6',
      category_id: 4,
    },
  ],

  product_customizations: [
    {
      id: 1,
      product_id: 'e7c8f8f0-1d8a-4d3c-9f3e-3b5e2e8a1d6c',
      name: 'Color Variation',
      code: 'CV-001',
      remark: 'Available in blue, green, and red glazes',
    },
    {
      id: 2,
      product_id: 'a2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7',
      name: 'Size Options',
      code: 'SO-002',
      remark: 'Available in small (20x15cm) and large (30x25cm)',
    },
  ],

  product_customization_images: [
    {
      id: 1,
      customization_id: 1,
      image_url:
        'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
      display_order: 1,
    },
    {
      id: 2,
      customization_id: 1,
      image_url:
        'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
      display_order: 2,
    },
    {
      id: 3,
      customization_id: 2,
      image_url:
        'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
      display_order: 1,
    },
  ],

  product_links: [
    {
      id: 1,
      product_id: 'e7c8f8f0-1d8a-4d3c-9f3e-3b5e2e8a1d6c',
      link: 'https://example.com/supplier/vase-details',
      remark: 'Supplier product page',
      link_date: '2025-10-10',
    },
    {
      id: 2,
      product_id: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6',
      link: 'https://example.com/catalog/solar-lights',
      remark: 'Product catalog entry',
      link_date: '2025-11-05',
    },
  ],

  product_link_images: [
    {
      id: 1,
      product_link_id: 1,
      image_url:
        'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
      display_order: 1,
    },
    {
      id: 2,
      product_link_id: 1,
      image_url:
        'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
      display_order: 2,
    },
  ],

  product_alibaba_ids: [
    {
      id: 1,
      product_id: 'e7c8f8f0-1d8a-4d3c-9f3e-3b5e2e8a1d6c',
      value: '1600189276392',
      link: 'https://www.alibaba.com/product-detail/1600189276392.html',
    },
    {
      id: 2,
      product_id: 'a2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7',
      value: '1600283947563',
      link: 'https://www.alibaba.com/product-detail/1600283947563.html',
    },
  ],

  product_packings: [
    {
      id: 1,
      product_id: 'e7c8f8f0-1d8a-4d3c-9f3e-3b5e2e8a1d6c',
      packing_type_id: 1,
      length: 30.5,
      width: 20.75,
      height: 40.0,
      quantity: 1,
      weight: 2.5,
    },
    {
      id: 2,
      product_id: 'a2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7',
      packing_type_id: 3,
      length: 35.0,
      width: 28.0,
      height: 5.5,
      quantity: 10,
      weight: 4.75,
    },
    {
      id: 3,
      product_id: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6',
      packing_type_id: 1,
      length: 15.25,
      width: 15.25,
      height: 25.0,
      quantity: 6,
      weight: 3.2,
    },
  ],

  product_certificates: [
    {
      id: 1,
      product_id: 'e7c8f8f0-1d8a-4d3c-9f3e-3b5e2e8a1d6c',
      certificate_type_id: 1,
      remark: 'Certified for European market',
    },
    {
      id: 2,
      product_id: 'a2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7',
      certificate_type_id: 3,
      remark: 'Compliant with RoHS directive',
    },
    {
      id: 3,
      product_id: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6',
      certificate_type_id: 2,
      remark: 'Manufactured under ISO 9001 quality management',
    },
  ],

  product_certificate_files: [
    {
      id: 1,
      certificate_id: 1,
      file_url:
        'public/products/202511211658/files/quotation-sq202511221513-282-rivolx-limited-arman-sayed.pdf',
    },
    {
      id: 2,
      certificate_id: 2,
      file_url:
        'public/products/202511211658/files/quotation-sq202511221513-282-rivolx-limited-arman-sayed.pdf',
    },
    {
      id: 3,
      certificate_id: 3,
      file_url:
        'public/products/202511211658/files/quotation-sq202511221513-282-rivolx-limited-arman-sayed.pdf',
    },
  ],

  // Master data
  product_name_types: [
    { id: 1, name: 'English', description: 'English product name' },
    { id: 2, name: 'Chinese', description: 'Chinese product name' },
    { id: 3, name: 'Technical', description: 'Technical specification name' },
  ],

  categories: [
    {
      id: 1,
      name: 'Home Decor',
      description: 'Home decoration items',
      parent_id: null,
    },
    { id: 2, name: 'Kitchen', description: 'Kitchen products', parent_id: 1 },
    {
      id: 3,
      name: 'Outdoor',
      description: 'Outdoor products',
      parent_id: null,
    },
    { id: 4, name: 'Garden', description: 'Garden accessories', parent_id: 3 },
  ],

  packing_types: [
    { id: 1, name: 'Box', description: 'Standard cardboard box' },
    { id: 2, name: 'Pallet', description: 'Wooden pallet for bulk shipping' },
    { id: 3, name: 'Carton', description: 'Corrugated carton packaging' },
  ],

  certificate_types: [
    { id: 1, name: 'CE', description: 'European Conformity certification' },
    {
      id: 2,
      name: 'ISO 9001',
      description: 'Quality management certification',
    },
    { id: 3, name: 'RoHS', description: 'Restriction of Hazardous Substances' },
  ],
};

export default sampleProducts;
