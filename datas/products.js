// Sample product data based on TABLE_MASTER schema

export const defaultProducts = {
  products: [
    {
      icon_url: 'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
      remark: 'Premium quality product with multiple customization options',
      created_at: '2025-10-15T10:30:00Z',
      updated_at: '2025-11-20T14:45:00Z',
      product_names: [
        {
          name: 'Decorative Ceramic Vase',
          name_type_id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p', // English
        },
        {
          name: '装饰陶瓷花瓶',
          name_type_id: '9b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q', // Chinese
        },
      ],
      product_categories: [
        {
          category_id: 'c7500000-0000-0000-0000-000000000000', // Pet Water Fountain
        },
      ],
      product_customizations: [
        {
          name: 'Color Variation',
          code: 'CV-001',
          remark: 'Available in blue, green, and red glazes',
          product_customization_images: [
            {
              image_url:
                'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
              base64_image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
              display_order: 1,
            },
            {
              image_url:
                'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
              base64_image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
              display_order: 2,
            },
          ],
        },
      ],
      product_links: [
        {
          link: 'https://example.com/supplier/vase-details',
          remark: 'Supplier product page',
          link_date: '2025-10-10',
          product_link_images: [
            {
              image_url:
                'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
              base64_image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
              display_order: 1,
            },
            {
              image_url:
                'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
              base64_image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
              display_order: 2,
            },
          ],
        },
      ],
      product_alibaba_ids: [
        {
          value: '1600189276392',
          link: 'https://www.alibaba.com/product-detail/1600189276392.html',
        },
      ],
      product_packings: [
        {
          packing_type_id: '5h8i9j0k-1l2m-3n4o-5p6q-7r8s9t0u1v2w', // Box
          length: 30.5,
          width: 20.75,
          height: 40.0,
          quantity: 1,
          weight: 2.5,
        },
      ],
      product_certificates: [
        {
          certificate_type_id: '8k1l2m3n-4o5p-6q7r-8s9t-0u1v2w3x4y5z', // CE
          remark: 'Certified for European market',
          product_certificate_files: [
            {
              file_url:
                'public/products/202511211658/files/quotation-sq202511221513-282-rivolx-limited-arman-sayed.txt',
              base64_file:
                'data:text/plain;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGZpbGUgd2l0aCBjb250ZW50IGVuY29kZWQgaW4gYmFzZTY0Lg==',
              file_type: 'document',
              display_order: 1,
            },
          ],
        },
      ],
    },
    {
      icon_url: 'public/products/202511201324/Alibaba 1688/display/Main_03.jpg',
      remark: 'Eco-friendly material, suitable for outdoor use',
      created_at: '2025-09-22T08:15:00Z',
      updated_at: '2025-11-18T09:20:00Z',
      product_names: [
        {
          name: 'Bamboo Cutting Board',
          name_type_id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p', // English
        },
      ],
      product_categories: [
        {
          category_id: 'c1400000-0000-0000-0000-000000000000', // Dog Bowl
        },
      ],
      product_customizations: [
        {
          name: 'Size Options',
          code: 'SO-002',
          remark: 'Available in small (20x15cm) and large (30x25cm)',
          product_customization_images: [
            {
              image_url:
                'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
              base64_image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
              display_order: 1,
            },
          ],
        },
      ],
      product_links: [],
      product_alibaba_ids: [
        {
          value: '1600283947563',
          link: 'https://www.alibaba.com/product-detail/1600283947563.html',
        },
      ],
      product_packings: [
        {
          packing_type_id: '7j0k1l2m-3n4o-5p6q-7r8s-9t0u1v2w3x4y', // Carton
          length: 35.0,
          width: 28.0,
          height: 5.5,
          quantity: 10,
          weight: 4.75,
        },
      ],
      product_certificates: [
        {
          certificate_type_id: '0m3n4o5p-6q7r-8s9t-0u1v-2w3x4y5z6a7b', // RoHS
          remark: 'Compliant with RoHS directive',
          product_certificate_files: [
            {
              file_url:
                'public/products/202511211658/files/quotation-sq202511221513-282-rivolx-limited-arman-sayed.txt',
              base64_file:
                'data:text/plain;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGZpbGUgd2l0aCBjb250ZW50IGVuY29kZWQgaW4gYmFzZTY0Lg==',
              file_type: 'document',
              display_order: 2,
            },
          ],
        },
      ],
    },
    // Add additional products here in the same format as above
  ],
};
export const product_master_data = {
  // Master data with UUID format
  master_product_name_types: [
    {
      id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
      name: '1688',
      description: '1688 product name',
    },
    {
      id: '9b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q',
      name: 'Alibaba',
      description: 'Alibaba product name',
    },
    {
      id: '0c3d4e5f-6g7h-8i9j-0k1l-2m3n4o5p6q7r',
      name: 'Amazon',
      description: 'Amazon product name',
    },
    {
      id: '0c3d4e5f-6g7h-8i9j-0k1l-124fg45563fg',
      name: 'Shopify',
      description: 'Shopify product name',
    },
  ],

  // Updated master_categories based on the image structure
  master_categories: [
    // Main Categories
    {
      id: 'c1000000-0000-0000-0000-000000000000',
      name: 'Pet Bowls & Accessories',
      description: 'Pet feeding and water accessories',
      parent_id: null,
    },
    {
      id: 'c2000000-0000-0000-0000-000000000000',
      name: 'Pet Cages & Houses',
      description: 'Pet housing and containment products',
      parent_id: null,
    },
    {
      id: 'c3000000-0000-0000-0000-000000000000',
      name: 'Pet Carriers & Travel',
      description: 'Pet transportation and travel accessories',
      parent_id: null,
    },
    {
      id: 'c4000000-0000-0000-0000-000000000000',
      name: 'Pet Cleaning & Grooming',
      description: 'Pet grooming and hygiene products',
      parent_id: null,
    },
    {
      id: 'c5000000-0000-0000-0000-000000000000',
      name: 'Cat Litter & Accessories',
      description: 'Cat litter and related products',
      parent_id: null,
    },
    {
      id: 'c6000000-0000-0000-0000-000000000000',
      name: 'Pet Toys',
      description: 'Pet toys and play accessories',
      parent_id: null,
    },
    {
      id: 'c7000000-0000-0000-0000-000000000000',
      name: 'Others',
      description: 'Other pet accessories and products',
      parent_id: null,
    },
    {
      id: 'c8000000-0000-0000-0000-000000000000',
      name: 'Aquatic Items',
      description: 'Products for aquatic pets and aquariums',
      parent_id: null,
    },

    // Pet Bowls & Accessories subcategories
    {
      id: 'c1100000-0000-0000-0000-000000000000',
      name: 'Pet Mat',
      description: 'Mats for pet feeding areas',
      parent_id: 'c1000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c1200000-0000-0000-0000-000000000000',
      name: 'Pet Bowls & Feeders',
      description: 'Bowls and automatic feeders for pets',
      parent_id: 'c1000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c1300000-0000-0000-0000-000000000000',
      name: 'Pet Dispenser',
      description: 'Food and water dispensers for pets',
      parent_id: 'c1000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c1400000-0000-0000-0000-000000000000',
      name: 'Dog Bowl',
      description: 'Bowls specifically designed for dogs',
      parent_id: 'c1000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c1500000-0000-0000-0000-000000000000',
      name: 'Cat Bowl',
      description: 'Bowls specifically designed for cats',
      parent_id: 'c1000000-0000-0000-0000-000000000000',
    },

    // Pet Cages & Houses subcategories
    {
      id: 'c2100000-0000-0000-0000-000000000000',
      name: 'Pet Cages',
      description: 'Cages for pets',
      parent_id: 'c2000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c2200000-0000-0000-0000-000000000000',
      name: 'Pet Nest',
      description: 'Nests and beds for pets',
      parent_id: 'c2000000-0000-0000-0000-000000000000',
    },

    // Pet Carriers & Travel subcategories
    {
      id: 'c3100000-0000-0000-0000-000000000000',
      name: 'Dog Leash',
      description: 'Leashes for dogs',
      parent_id: 'c3000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c3200000-0000-0000-0000-000000000000',
      name: 'Dog Harness',
      description: 'Harnesses for dogs',
      parent_id: 'c3000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c3300000-0000-0000-0000-000000000000',
      name: 'Dog Collar',
      description: 'Collars for dogs',
      parent_id: 'c3000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c3400000-0000-0000-0000-000000000000',
      name: 'Cat Collar',
      description: 'Collars for cats',
      parent_id: 'c3000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c3500000-0000-0000-0000-000000000000',
      name: 'Pet Carrier',
      description: 'Carriers for pets',
      parent_id: 'c3000000-0000-0000-0000-000000000000',
    },

    // Pet Cleaning & Grooming subcategories
    {
      id: 'c4100000-0000-0000-0000-000000000000',
      name: 'Teeth Cleaning',
      description: 'Dental hygiene products for pets',
      parent_id: 'c4000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c4200000-0000-0000-0000-000000000000',
      name: 'Dog Grooming',
      description: 'Grooming products for dogs',
      parent_id: 'c4000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c4300000-0000-0000-0000-000000000000',
      name: 'Cat Grooming',
      description: 'Grooming products for cats',
      parent_id: 'c4000000-0000-0000-0000-000000000000',
    },

    // Cat Litter & Accessories subcategories
    {
      id: 'c5100000-0000-0000-0000-000000000000',
      name: 'Pet Litter Cleaning',
      description: 'Products for cleaning pet litter',
      parent_id: 'c5000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c5200000-0000-0000-0000-000000000000',
      name: 'Cat Litter Box',
      description: 'Litter boxes for cats',
      parent_id: 'c5000000-0000-0000-0000-000000000000',
    },

    // Pet Toys subcategories
    {
      id: 'c6100000-0000-0000-0000-000000000000',
      name: 'Cat Toys',
      description: 'Toys for cats',
      parent_id: 'c6000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c6200000-0000-0000-0000-000000000000',
      name: 'Dog Toys',
      description: 'Toys for dogs',
      parent_id: 'c6000000-0000-0000-0000-000000000000',
    },

    // Others subcategories
    {
      id: 'c7100000-0000-0000-0000-000000000000',
      name: 'Pet Ramp',
      description: 'Ramps for pets',
      parent_id: 'c7000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c7200000-0000-0000-0000-000000000000',
      name: 'Pet Backseat Cover',
      description: 'Covers for car backseats',
      parent_id: 'c7000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c7300000-0000-0000-0000-000000000000',
      name: 'Cat Scratching Board',
      description: 'Scratching boards for cats',
      parent_id: 'c7000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c7400000-0000-0000-0000-000000000000',
      name: 'Pet Clothing',
      description: 'Clothing for pets',
      parent_id: 'c7000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c7500000-0000-0000-0000-000000000000',
      name: 'Pet Water Fountain',
      description: 'Water fountains for pets',
      parent_id: 'c7000000-0000-0000-0000-000000000000',
    },

    // Aquatic Items subcategories
    {
      id: 'c8100000-0000-0000-0000-000000000000',
      name: 'Pump',
      description: 'Pumps for aquariums',
      parent_id: 'c8000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c8200000-0000-0000-0000-000000000000',
      name: 'Horse Supplies',
      description: 'Supplies for horses',
      parent_id: 'c8000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c8300000-0000-0000-0000-000000000000',
      name: 'Bird Supplies',
      description: 'Supplies for birds',
      parent_id: 'c8000000-0000-0000-0000-000000000000',
    },
    {
      id: 'c8400000-0000-0000-0000-000000000000',
      name: 'Dog Barking Controller',
      description: 'Devices to control dog barking',
      parent_id: 'c8000000-0000-0000-0000-000000000000',
    },
  ],

  // Updated master_packing_types with the provided default packing types
  master_packing_types: [
    {
      id: '5h8i9j0k-1l2m-3n4o-5p6q-7r8s9t0u1v2w',
      name: 'Box',
      description: 'Standard cardboard box',
    },
    {
      id: '6i9j0k1l-2m3n-4o5p-6q7r-8s9t0u1v2w3x',
      name: 'Pallet',
      description: 'Wooden pallet for bulk shipping',
    },
    {
      id: '7j0k1l2m-3n4o-5p6q-7r8s-9t0u1v2w3x4y',
      name: 'Carton',
      description: 'Corrugated carton packaging',
    },
    {
      id: '8k1l2m3n-4o5p-6q7r-8s9t-9t0u1v2w3x4z',
      name: 'Single Unit',
      description: 'Individual product packaging',
    },
    {
      id: '9l2m3n4o-5p6q-7r8s-9t0u-9t0u1v2w3x5a',
      name: 'Inner Box',
      description: 'Inner packaging box',
    },
    {
      id: '0m3n4o5p-6q7r-8s9t-0u1v-9t0u1v2w3x5b',
      name: 'Master Carton',
      description: 'Master carton for multiple units',
    },
    {
      id: '1n4o5p6q-7r8s-9t0u-1v2w-9t0u1v2w3x5c',
      name: 'Polybag',
      description: 'Plastic polybag packaging',
    },
    {
      id: '2o5p6q7r-8s9t-0u1v-2w3x-9t0u1v2w3x5d',
      name: 'Blister Pack',
      description: 'Blister packaging',
    },
    {
      id: '3p6q7r8s-9t0u-1v2w-3x4y-9t0u1v2w3x5e',
      name: 'Shrink Wrap',
      description: 'Shrink wrapped packaging',
    },
  ],

  // Updated master_certificate_types with missing IDs
  master_certificate_types: [
    {
      id: '8k1l2m3n-4o5p-6q7r-8s9t-0u1v2w3x4y5z',
      name: 'CE',
      description: 'European Conformity certification',
    },
    {
      id: '9l2m3n4o-5p6q-7r8s-9t0u-1v2w3x4y5z6a',
      name: 'ISO 9001',
      description: 'Quality management certification',
    },
    {
      id: '0m3n4o5p-6q7r-8s9t-0u1v-2w3x4y5z6a7b',
      name: 'RoHS',
      description: 'Restriction of Hazardous Substances',
    },
    {
      id: '1n4o5p6q-7r8s-9t0u-1v2w-3x4y5z6a7b8c',
      name: 'FDA',
      description: 'Food and Drug Administration approval',
    },
    {
      id: '2o5p6q7r-8s9t-0u1v-2w3x-4y5z6a7b8c9d',
      name: 'REACH',
      description:
        'Registration, Evaluation, Authorization and Restriction of Chemicals',
    },
    {
      id: '3p6q7r8s-9t0u-1v2w-3x4y-5z6a7b8c9d0e',
      name: 'UL',
      description: 'Underwriters Laboratories safety certification',
    },
    {
      id: '4q7r8s9t-0u1v-2w3x-4y5z-6a7b8c9d0e1f',
      name: 'ASTM',
      description: 'American Society for Testing and Materials standards',
    },
    {
      id: '5r8s9t0u-1v2w-3x4y-5z6a-7b8c9d0e1f2g',
      name: 'CPSC',
      description: 'Consumer Product Safety Commission compliance',
    },
  ],
};
