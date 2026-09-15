// Auto-generated from models/tables.js.
export const PRODUCTS_TABLE_DEFINITIONS = {
  PRODUCTS: {
    name: 'products',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      icon_name: {
        type: 'VARCHAR(255)',
        description: 'product icon name',
      },
      icon_url: {
        type: 'TEXT',
        description: 'URL to product icon image',
      },
      hs_code: {
        type: 'VARCHAR(255)',
        description: 'HS Code for the product',
      },
      product_index: {
        type: 'VARCHAR(255)',
        description: 'Index for ordering products',
      },
      product_status_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_product_status',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_product_status.id',
      },
      selling_unit_type_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_selling_unit_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_selling_unit_types.id',
      },
      selling_by_mode: {
        type: 'VARCHAR(255)',
        description:
          'Description of how the product is sold (e.g., by quantity, by variants). If by_qty, the product price is stored in PRODUCT_SALE_PRICES_BY_QTY. If by_variants, the product price is stored in PRODUCT_COSTS table. This field is used to determine which pricing table to use for the product.',
        notNull: true,
        default: 'by_qty',
        constraints: {
          check_selling_by: {
            expression:
              "selling_by_mode IN ('by_qty', 'by_variants', 'by_single_price')",
          },
        },
      },
      min_order_qty: {
        type: 'INT',
        default: 1,
        description: 'Minimum order quantity for this variant combination',
      },
      sale_single_price_currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_currencies.id',
      },
      sale_single_price_min: {
        type: 'DECIMAL(10,3)',
        description: 'Minimum single price for the product',
      },
      sale_single_price_max: {
        type: 'DECIMAL(10,3)',
        description: 'Maximum single price for the product',
      },
      sampling_service_available: {
        type: 'BOOLEAN',
        default: false,
        description:
          'Indicates if sampling service is available for the product. The sample price will be displayed in product cost table if this is true.',
      },
      max_qty_sample: {
        type: 'INT',
        description:
          'Maximum quantity available for sampling in a single transaction',
      },
      product_logistics_attributes_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_product_logistics_attributes',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_product_logistics_attributes.id',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the product',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_VARIENT_SIZES: {
    name: 'product_varient_sizes',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      size_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_size_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_size_types.id',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_VARIENT_CAPACITIES: {
    name: 'product_varient_capacities',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      capacity_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_capacity_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_capacity_types.id',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_VARIENT_COLORS: {
    name: 'product_varient_colors',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      color_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_color_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_color_types.id',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_VARIENT_COLOR_IMAGES: {
    name: 'product_varient_color_images',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      product_varient_color_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'product_varient_colors',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to product_varient_colors.id',
      },
      image_name: {
        type: 'VARCHAR(255)',
        description: 'image name',
      },
      image_url: {
        type: 'TEXT',
        description: 'URL to color-related image',
      },
      alt_text: {
        type: 'VARCHAR(255)',
        description: 'alt text to color-related image',
      },
      display_order: {
        type: 'INT',
        default: 0,
        description: 'Order for display purposes',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_COSTS: {
    name: 'product_costs',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      product_varient_size_id: {
        type: 'VARCHAR(36)',
        notNull: false,
        references: {
          table: 'product_varient_sizes',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to product_varient_sizes.id',
      },
      product_varient_color_id: {
        type: 'VARCHAR(36)',
        notNull: false,
        references: {
          table: 'product_varient_colors',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to product_varient_colors.id',
      },
      product_varient_capacity_id: {
        type: 'VARCHAR(36)',
        notNull: false,
        references: {
          table: 'product_varient_capacities',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to product_varient_capacities.id',
      },
      currency_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_currencies.id for the cost currency',
      },
      unit_cost: {
        type: 'DECIMAL(10,3)',
        notNull: true,
        description: 'Unit cost for the size-color variant combination',
      },
      sales_currency_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description:
          'Reference to master_currencies.id for the sales price currency',
      },
      sales_price: {
        type: 'DECIMAL(10,3)',
        description: 'Sales price for the size-color variant combination',
        notNull: true,
      },
      sample_currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description:
          'Reference to master_currencies.id for the sample price currency',
      },
      sample_price: {
        type: 'DECIMAL(10,3)',
        description:
          'Sample price of single unit for the size-color variant combination',
      },
      sku: {
        type: 'VARCHAR(255)',
        description:
          'Stock Keeping Unit for the size-color variant combination',
      },
      stock_qty: {
        type: 'INT',
        default: 0,
        description: 'Current stock quantity for this variant combination',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about pricing',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
    constraints: {
      unique_product_size_color_cost: {
        type: 'UNIQUE',
        fields: [
          'product_id',
          'product_varient_size_id',
          'product_varient_color_id',
          'product_varient_capacity_id',
        ],
      },
    },
  },
  PRODUCT_SALE_PRICES_BY_QTY: {
    name: 'product_sale_prices_by_qty',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      min_order_qty: {
        type: 'INT',
        notNull: true,
        description: 'Minimum quantity for the sale price',
      },
      currency_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description:
          'Reference to master_currencies.id for the sale price currency',
      },
      sale_price: {
        type: 'DECIMAL(10,3)',
        notNull: true,
        description: 'Sale price for the product',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
    constraints: {
      unique_product_sale_price: {
        type: 'UNIQUE',
        fields: ['product_id', 'currency_id'],
      },
    },
  },
  PRODUCT_KEYWORDS: {
    name: 'product_keywords',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      keyword_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_keywords',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_keywords.id',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
    constraints: {
      unique_product_keyword: {
        type: 'UNIQUE',
        fields: ['product_id', 'keyword_id'],
      },
    },
  },
  PRODUCT_IMAGES: {
    name: 'product_images',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      image_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_product_image_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_product_image_types.id',
      },
      image_row: {
        type: 'VARCHAR(36)',
        description:
          'Reference to a specific row in another table that this image is associated with (e.g., a specific product variant)',
        notNull: true,
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'image name',
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to product image',
      },
      alt_text: {
        type: 'VARCHAR(255)',
        description: 'alt text to product image',
      },
      display_order: {
        type: 'VARCHAR(36)',
        default: 0,
        description: 'Order for display purposes',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_NAMES: {
    name: 'product_names',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Product name',
      },
      name_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_product_name_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_product_name_types.id',
      },
      display_order: {
        type: 'INT',
        default: 0,
        description: 'Order for display purposes',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
    constraints: {
      unique_product_name_type: {
        type: 'UNIQUE',
        fields: ['product_id', 'name_type_id', 'name'],
      },
    },
  },
  PRODUCT_CATEGORIES: {
    name: 'product_categories',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      category_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_categories',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to master_categories.id',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
    constraints: {
      unique_product_category: {
        type: 'UNIQUE',
        fields: ['product_id', 'category_id'],
      },
    },
  },
  PRODUCT_CUSTOMIZATIONS: {
    name: 'product_customizations',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Customization name',
      },
      code: {
        type: 'VARCHAR(50)',
        description: 'Customization code',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the customization',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_CUSTOMIZATION_IMAGES: {
    name: 'product_customization_images',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      customization_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'product_customizations',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to product_customizations.id',
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'image name',
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to customization image',
      },
      display_order: {
        type: 'INT',
        default: 0,
        description: 'Order for display purposes',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_LINKS: {
    name: 'product_links',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      name: {
        type: 'VARCHAR(255)',
        notNull: false,
        description: 'Link name or description',
      },
      link: {
        type: 'TEXT',
        notNull: false,
        description: 'URL link related to product',
      },
      score: {
        type: 'FLOAT',
        description: 'Score related to the link, 1-10,',
        default: 1,
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the link',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_LINK_IMAGES: {
    name: 'product_link_images',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_link_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'product_links',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to product_links.id',
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'image name',
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to link-related image',
      },
      display_order: {
        type: 'INT',
        default: 0,
        description: 'Order for display purposes',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_ALIBABA_IDS: {
    name: 'product_alibaba_ids',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      value: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Alibaba product ID value',
      },
      link: {
        type: 'TEXT',
        description: 'URL to Alibaba product page',
      },
      display_order: {
        type: 'INT',
        default: 0,
        description: 'Order for display purposes',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_PACKINGS: {
    name: 'product_packings',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      packing_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_packing_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_packing_types.id',
      },
      packing_reliability_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_packing_reliability_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_packing_reliability_types.id',
      },
      name: {
        type: 'VARCHAR(255)',
        notNull: false,
        description: 'Packing name or identifier',
      },
      length: {
        type: 'DECIMAL(10,3)',
        notNull: false,
        description: 'Length dimension',
      },
      width: {
        type: 'DECIMAL(10,3)',
        notNull: false,
        description: 'Width dimension',
      },
      height: {
        type: 'DECIMAL(10,3)',
        notNull: false,
        description: 'Height dimension',
      },
      quantity: {
        type: 'VARCHAR(36)',
        notNull: false,
        default: 1,
        description: 'Quantity in this packing',
      },
      weight: {
        type: 'DECIMAL(10,3)',
        notNull: false,
        description: 'Weight of the packing',
      },
      remark: {
        type: 'TEXT',
        description: 'Packing Remark',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_PACKING_FILES: {
    name: 'product_packing_files',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      packing_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'product_packings',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to product_packings.id',
      },
      file_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'File name',
      },
      file_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to packing file',
      },
      display_order: {
        type: 'INT',
        default: 0,
        description: 'Order for display purposes',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_CERTIFICATES: {
    name: 'product_certificates',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      certificate_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_certificate_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_certificate_types.id',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the certificate',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_CERTIFICATE_FILES: {
    name: 'product_certificate_files',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      certificate_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'product_certificates',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to product_certificates.id',
      },
      file_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'file name',
      },
      file_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to certificate file',
      },
      display_order: {
        type: 'INT',
        default: 0,
        description: 'Order for display purposes',
      },
      file_type: {
        type: 'VARCHAR(50)',
        description: 'Type of certificate file',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Description of the certificate file',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_DELIVERY_DATES: {
    name: 'product_delivery_dates',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      min_order_qty: {
        type: 'INT',
        notNull: true,
        description: 'Minimum order quantity for this delivery date',
      },
      delivery_day: {
        type: 'INT',
        notNull: true,
        description: 'delivery day for the product',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
  PRODUCT_ATTRIBUTE_VALUES: {
    name: 'product_attribute_values',
    table_type: 'products-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to products.id',
      },
      attribute_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_product_attributes',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to master_product_attributes.id',
      },
      value: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Value of the attribute for the product',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
    },
  },
};
