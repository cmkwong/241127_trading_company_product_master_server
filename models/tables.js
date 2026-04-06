// Centralized table and field definitions
const TABLE_MASTER_RAW = {
  // Main tables
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
  MASTER_PRODUCT_STATUS: {
    name: 'master_product_status',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Product status name',
      },
      description: {
        type: 'TEXT',
        description: 'Product status description',
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
  MASTER_CURRENCIES: {
    name: 'master_currencies',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      code: {
        type: 'VARCHAR(10)',
        notNull: true,
        description: 'Currency code (e.g., USD, EUR)',
      },
      name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Currency name',
      },
      symbol: {
        type: 'VARCHAR(10)',
        description: 'Currency symbol (e.g., $, €)',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Last update timestamp',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
    },
    constraints: {
      unique_currency_code: { type: 'UNIQUE', fields: ['code'] },
    },
  },
  MASTER_SIZE_TYPES: {
    name: 'master_size_types',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'id for master size types',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Size type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Size type description',
      },
      default_display_cb: {
        type: 'BOOLEAN',
        default: false,
        description: 'Indicates if this is the default size type in checkboxes',
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
      unique_size_type_name: { type: 'UNIQUE', fields: ['name'] },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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
  MASTER_CAPACITY_TYPES: {
    name: 'master_capacity_types',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'id for master capacity types',
      },
      value: {
        type: 'FLOAT',
        notNull: true,
        description: 'Capacity type value (e.g., 16)',
      },
      unit: {
        type: 'VARCHAR(20)',
        notNull: true,
        description: 'Unit for capacity (e.g., g, ml, oz)',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Capacity type description',
      },
      default_display_cb: {
        type: 'BOOLEAN',
        default: false,
        description:
          'Indicates if this is the default capacity type in checkboxes',
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
      unique_capacity_type_value_unit: {
        type: 'UNIQUE',
        fields: ['value', 'unit'],
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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
  MASTER_COLOR_TYPES: {
    name: 'master_color_types',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Color type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Color type description',
      },
      default_display_cb: {
        type: 'BOOLEAN',
        default: false,
        description:
          'Indicates if this is the default color type in checkboxes',
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
      unique_color_type_name: { type: 'UNIQUE', fields: ['name'] },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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
        type: 'DECIMAL(10,2)',
        notNull: true,
        description: 'Unit cost for the size-color variant combination',
      },
      min_order_qty: {
        type: 'INT',
        default: 1,
        description: 'Minimum order quantity for this variant combination',
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
  MASTER_KEYWORDS: {
    name: 'master_keywords',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'id for master keywords',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Keyword name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Keyword description',
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
      unique_keyword_name: { type: 'UNIQUE', fields: ['name'] },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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

  MASTER_PRODUCT_IMAGE_TYPES: {
    name: 'master_product_image_types',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'id for master product image types',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Image type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Image type description',
      },
      parent_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_product_image_types',
          field: 'id',
          onDelete: 'SET NULL', // to allow for hierarchical image types without forcing deletion of child types if a parent is deleted
        },
        description: 'Parent image type ID for hierarchical structure',
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
      unique_product_image_type: { type: 'UNIQUE', fields: ['name'] },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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

  MASTER_PRODUCT_NAME_TYPES: {
    name: 'master_product_name_types',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'uuid',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Name type identifier',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Description of the name type',
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
      unique_name_type: { type: 'UNIQUE', fields: ['name'] },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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

  MASTER_CATEGORIES: {
    name: 'master_categories',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Category name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Category description',
      },
      parent_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_categories',
          field: 'id',
          onDelete: 'SET NULL',
        },
        description: 'Parent category ID for hierarchical structure',
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to products.id',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Customization name',
      },
      code: { type: 'VARCHAR(50)', description: 'Customization code' },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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
      scores: {
        type: 'FLOAT',
        description: 'Score related to the link, 1-10,',
        default: 1.0,
      },
      remark: { type: 'TEXT', description: 'Additional notes about the link' },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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

  MASTER_PACKING_TYPES: {
    name: 'master_packing_types',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Packing type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Packing type description',
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
      unique_packing_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },
  MASTER_PACKING_RELIABILITY_TYPES: {
    name: 'master_packing_reliability_types',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Packing reliability type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Packing reliability type description',
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
      unique_reliability_name: { type: 'UNIQUE', fields: ['name'] },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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
        type: 'DECIMAL(10,2)',
        notNull: false,
        description: 'Length dimension',
      },
      width: {
        type: 'DECIMAL(10,2)',
        notNull: false,
        description: 'Width dimension',
      },
      height: {
        type: 'DECIMAL(10,2)',
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
        type: 'DECIMAL(10,2)',
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

  MASTER_CERTIFICATE_TYPES: {
    name: 'master_certificate_types',
    table_type: 'products-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Certificate type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Certificate type description',
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
      unique_certificate_type_name: { type: 'UNIQUE', fields: ['name'] },
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
        references: { table: 'products', field: 'id', onDelete: 'CASCADE' },
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
  MASTER_SUPPLIER_TYPES: {
    name: 'master_supplier_types',
    table_type: 'suppliers-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Supplier type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Supplier type description',
      },
      parent_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_supplier_types',
          field: 'id',
          onDelete: 'SET NULL',
        },
        description: 'Parent supplier type ID for hierarchical structure',
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
      unique_supplier_type_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },
  SUPPLIERS: {
    name: 'suppliers',
    table_type: 'suppliers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      supplier_code: {
        type: 'VARCHAR(50)',
        notNull: true,
        description: 'Unique code for the supplier',
      },
      name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Supplier name',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the supplier',
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
      unique_supplier_code: { type: 'UNIQUE', fields: ['supplier_code'] },
    },
  },
  SUPPLIER_TYPES: {
    name: 'supplier_types',
    table_type: 'suppliers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      supplier_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'suppliers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to suppliers.id',
      },
      supplier_type_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_supplier_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_supplier_types.id',
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
  MASTER_ADDRESS_TYPES: {
    name: 'master_address_types',
    table_type: 'suppliers-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Address type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Address type description',
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
      unique_address_type_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },
  SUPPLIER_ADDRESSES: {
    name: 'supplier_addresses',
    table_type: 'suppliers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      supplier_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'suppliers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to suppliers.id',
      },
      address_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_address_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_address_types.id',
      },
      address_line1: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'First line of the address',
      },
      address_line2: {
        type: 'VARCHAR(255)',
        description: 'Second line of the address',
      },
      address_line3: {
        type: 'VARCHAR(255)',
        description: 'Third line of the address',
      },
      city: {
        type: 'VARCHAR(100)',
        description: 'City of the address',
      },
      state: {
        type: 'VARCHAR(100)',
        description: 'State of the address',
      },
      zip_code: {
        type: 'VARCHAR(20)',
        description: 'ZIP code of the address',
      },
      country: {
        type: 'VARCHAR(100)',
        description: 'Country of the address',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the address',
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
      unique_supplier_address: {
        type: 'UNIQUE',
        fields: ['supplier_id', 'address_type_id'],
      },
    },
  },
  MASTER_CONTACT_TYPES: {
    name: 'master_contact_types',
    table_type: 'suppliers-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Contact type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Contact type description',
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
      unique_contact_type_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },
  SUPPLIER_CONTACTS: {
    name: 'supplier_contacts',
    table_type: 'suppliers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      supplier_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'suppliers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to suppliers.id',
      },
      contact_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_contact_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_contact_types.id',
      },
      contact_name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Name of the contact',
      },
      contact_number: {
        type: 'VARCHAR(50)',
        description: 'Contact number (e.g., phone, fax)',
      },
      contact_email: {
        type: 'VARCHAR(255)',
        description: 'Contact email address',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the contact',
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
      unique_supplier_contact: {
        type: 'UNIQUE',
        fields: ['supplier_id', 'contact_type_id'],
      },
    },
  },
  MASTER_SUPPLIER_LINK_TYPES: {
    name: 'master_supplier_link_types',
    table_type: 'suppliers-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Supplier type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Supplier type description',
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
      unique_supplier_link_type_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },
  SUPPLIER_LINKS: {
    name: 'supplier_links',
    table_type: 'suppliers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      supplier_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'suppliers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to suppliers.id',
      },
      link_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_supplier_link_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_supplier_link_types.id',
      },
      link: {
        type: 'TEXT',
        notNull: true,
        description: 'URL link related to supplier',
      },
      remark: { type: 'TEXT', description: 'Additional notes about the link' },
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
    constraints: {},
  },
  MASTER_SERVICES: {
    name: 'master_services',
    table_type: 'services-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      service_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Name of the service',
      },
      description: {
        type: 'TEXT',
        description: 'Description of the service',
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
  MASTER_SERVICE_IMAGES: {
    name: 'master_service_images',
    table_type: 'services-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      service_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_services',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to master_services.id',
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Image name',
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to service image',
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
  SUPPLIER_SERVICES: {
    name: 'supplier_services',
    table_type: 'suppliers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      supplier_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'suppliers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to suppliers.id',
      },
      service_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_services',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_services.id',
      },
      link: {
        type: 'TEXT',
        description: 'URL link related to the service',
      },
      remark: {
        type: 'TEXT',
        description: 'Description of the service provided by the supplier',
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
    constraints: {},
  },
  SUPPLIER_SERVICE_IMAGES: {
    name: 'supplier_service_images',
    table_type: 'suppliers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      supplier_service_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'supplier_services',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to supplier_services.id',
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Image name',
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to service image',
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
  CUSTOMERS: {
    name: 'customers',
    table_type: 'customers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      customer_code: {
        type: 'VARCHAR(50)',
        notNull: true,
        description: 'Unique code for the customer',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the customer',
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
      unique_customer_code: { type: 'UNIQUE', fields: ['customer_code'] },
    },
  },
  MASTER_CUSTOMER_NAME_TYPES: {
    name: 'master_customer_name_types',
    table_type: 'customers-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Name of the customer',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Description of the customer name type',
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
      unique_customer_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },
  CUSTOMER_NAMES: {
    name: 'customer_names',
    table_type: 'customers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      customer_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'customers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to customers.id',
      },
      name_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_customer_name_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_customer_name_types.id',
      },
      name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Customer name',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the customer name',
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
      unique_customer_name_type: {
        type: 'UNIQUE',
        fields: ['customer_id', 'name_type_id'],
      },
    },
  },
  MASTER_CUSTOMER_TYPES: {
    name: 'master_customer_types',
    table_type: 'customers-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Customer type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Customer type description',
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
      unique_customer_type_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },
  CUSTOMER_TYPES: {
    name: 'customer_types',
    table_type: 'customers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      customer_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'customers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to customers.id',
      },
      customer_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_customer_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_customer_types.id',
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
      unique_customer_type: {
        type: 'UNIQUE',
        fields: ['customer_id', 'customer_type_id'],
      },
    },
  },
  CUSTOMER_ADDRESSES: {
    name: 'customer_addresses',
    table_type: 'customers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      customer_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'customers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to customers.id',
      },
      address_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_address_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_address_types.id',
      },
      address_line1: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'First line of the address',
      },
      address_line2: {
        type: 'VARCHAR(255)',
        description: 'Second line of the address',
      },
      address_line3: {
        type: 'VARCHAR(255)',
        description: 'Third line of the address',
      },
      city: {
        type: 'VARCHAR(100)',
        description: 'City of the address',
      },
      state: {
        type: 'VARCHAR(100)',
        description: 'State of the address',
      },
      zip_code: {
        type: 'VARCHAR(20)',
        description: 'Zip code of the address',
      },
      country: {
        type: 'VARCHAR(100)',
        description: 'Country of the address',
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
  CUSTOMER_CONTACTS: {
    name: 'customer_contacts',
    table_type: 'customers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      customer_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'customers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to customers.id',
      },
      contact_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_contact_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_contact_types.id',
      },
      contact_name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Name of the contact',
      },
      contact_number: {
        type: 'VARCHAR(50)',
        description: 'Contact number (e.g., phone, fax)',
      },
      contact_email: {
        type: 'VARCHAR(255)',
        description: 'Contact email address',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the contact',
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
      unique_customer_contact: {
        type: 'UNIQUE',
        fields: ['customer_id', 'contact_type_id'],
      },
    },
  },
  MASTER_CUSTOMER_IMAGE_TYPES: {
    name: 'master_customer_image_types',
    table_type: 'customers-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Customer image type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Customer image type description',
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
      unique_customer_image_type_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },
  CUSTOMER_IMAGES: {
    name: 'customer_images',
    table_type: 'customers-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Auto-incremented primary key',
      },
      customer_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'customers', field: 'id', onDelete: 'CASCADE' },
        description: 'Reference to customers.id',
      },
      image_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_customer_image_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_customer_image_types.id',
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Image name',
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to customer image',
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
  SALES_QUOTATIONS: {
    name: 'sales_quotations',
    table_type: 'sales-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true, description: 'UUID' },
      to_order: {
        type: 'BOOLEAN',
        default: false,
        description: 'Indicates if this quotation is ordered',
      },
      remark: { type: 'TEXT', description: 'Remark' },
      customer_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'customers', field: 'id', onDelete: 'RESTRICT' },
        description: 'Reference to customers.id',
      },
      customer_address_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'customer_addresses',
          field: 'id',
          onDelete: 'SET NULL',
        },
        description: 'Reference to customer_addresses.id',
      },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  SALES_SHIPPING_DETAILS: {
    name: 'sales_shipping_details',
    table_type: 'sales-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true, description: 'UUID' },
      sales_quotation_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_quotations',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      customer_address_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'customer_addresses',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      length: { type: 'DECIMAL(10,2)' },
      width: { type: 'DECIMAL(10,2)' },
      height: { type: 'DECIMAL(10,2)' },
      qty: { type: 'INT', default: 0 },
      weight: { type: 'DECIMAL(10,2)' },
      details: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  SALES_SHIPPING_PRICES: {
    name: 'sales_shipping_prices',
    table_type: 'sales-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true, description: 'UUID' },
      sales_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_shipping_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      supplier_id: {
        type: 'VARCHAR(36)',
        references: { table: 'suppliers', field: 'id', onDelete: 'SET NULL' },
      },
      incoterms: { type: 'VARCHAR(50)' },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: { type: 'DECIMAL(12,2)' },
      details: { type: 'TEXT' },
      selected: {
        type: 'BOOLEAN',
        default: false,
        description: 'Selected option for shipping',
      },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  SALES_SHIPPING_IMAGES: {
    name: 'sales_shipping_images',
    table_type: 'sales-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true, description: 'UUID' },
      sales_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_shipping_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_url: { type: 'TEXT', notNull: true },
      image_name: { type: 'VARCHAR(255)', notNull: true },
      display_order: { type: 'INT', default: 0 },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  SALES_PRODUCT_DETAILS: {
    name: 'sales_product_details',
    table_type: 'sales-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      sales_quotation_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_quotations',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'products', field: 'id', onDelete: 'RESTRICT' },
      },
      qty: { type: 'INT', default: 1 },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: { type: 'DECIMAL(12,2)' },
      details: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  SALES_PRODUCT_DETAIL_IMAGE_SELECTIONS: {
    name: 'sales_product_detail_image_selections',
    table_type: 'sales-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      sales_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_product_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'product_images',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
    constraints: {
      unique_sales_product_image_selection: {
        type: 'UNIQUE',
        fields: ['sales_product_detail_id', 'image_id'],
      },
    },
  },
  SALES_SERVICE_DETAILS: {
    name: 'sales_service_details',
    table_type: 'sales-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      sales_quotation_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_quotations',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      supplier_id: {
        type: 'VARCHAR(36)',
        references: { table: 'suppliers', field: 'id', onDelete: 'SET NULL' },
      },
      service_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_services',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      qty: { type: 'INT', default: 1 },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: { type: 'DECIMAL(12,2)' },
      details: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  SALES_SERVICE_DETAIL_IMAGE_SELECTIONS: {
    name: 'sales_service_detail_image_selections',
    table_type: 'sales-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      sales_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_service_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'supplier_service_images',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
    constraints: {
      unique_sales_service_image_selection: {
        type: 'UNIQUE',
        fields: ['sales_service_detail_id', 'image_id'],
      },
    },
  },
  AR_INVOICES: {
    name: 'ar_invoices',
    table_type: 'ar-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      remark: { type: 'TEXT' },
      customer_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'customers', field: 'id', onDelete: 'RESTRICT' },
      },
      customer_address_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'customer_addresses',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  ARI_SHIPPING_DETAILS: {
    name: 'ari_shipping_details',
    table_type: 'ar-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      ar_invoice_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'ar_invoices', field: 'id', onDelete: 'CASCADE' },
      },
      sales_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_shipping_details',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      received: { type: 'BOOLEAN', default: false },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  ARI_SHIPPING_FILES: {
    name: 'ari_shipping_files',
    table_type: 'ar-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      ari_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'ari_shipping_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_name: { type: 'VARCHAR(255)', notNull: true },
      file_url: { type: 'TEXT', notNull: true },
      display_order: { type: 'INT', default: 0 },
      file_type: { type: 'VARCHAR(100)' },
      description: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  ARI_PRODUCT_DETAILS: {
    name: 'ari_product_details',
    table_type: 'ar-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      ar_invoice_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'ar_invoices', field: 'id', onDelete: 'CASCADE' },
      },
      sales_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_product_details',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      received: { type: 'BOOLEAN', default: false },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  ARI_PRODUCT_FILES: {
    name: 'ari_product_files',
    table_type: 'ar-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      ari_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'ari_product_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_name: { type: 'VARCHAR(255)', notNull: true },
      file_url: { type: 'TEXT', notNull: true },
      display_order: { type: 'INT', default: 0 },
      file_type: { type: 'VARCHAR(100)' },
      description: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  ARI_SERVICE_DETAILS: {
    name: 'ari_service_details',
    table_type: 'ar-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      ar_invoice_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'ar_invoices', field: 'id', onDelete: 'CASCADE' },
      },
      sales_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_service_details',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      received: { type: 'BOOLEAN', default: false },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  ARI_SERVICE_FILES: {
    name: 'ari_service_files',
    table_type: 'ar-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      ari_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'ari_service_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_name: { type: 'VARCHAR(255)', notNull: true },
      file_url: { type: 'TEXT', notNull: true },
      display_order: { type: 'INT', default: 0 },
      file_type: { type: 'VARCHAR(100)' },
      description: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_REQUESTS: {
    name: 'purchase_requests',
    table_type: 'purchase-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      to_order: { type: 'BOOLEAN', default: false },
      remark: { type: 'TEXT' },
      supplier_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'suppliers', field: 'id', onDelete: 'RESTRICT' },
      },
      supplier_address_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'supplier_addresses',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_SHIPPING_DETAILS: {
    name: 'purchase_shipping_details',
    table_type: 'purchase-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      purchase_request_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_requests',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      supplier_address_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'supplier_addresses',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      length: { type: 'DECIMAL(10,2)' },
      width: { type: 'DECIMAL(10,2)' },
      height: { type: 'DECIMAL(10,2)' },
      quantity: { type: 'INT', default: 0 },
      weight: { type: 'DECIMAL(10,2)' },
      details: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_SHIPPING_IMAGES: {
    name: 'purchase_shipping_images',
    table_type: 'purchase-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      purchase_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_shipping_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_url: { type: 'TEXT', notNull: true },
      image_name: { type: 'VARCHAR(255)', notNull: true },
      display_order: { type: 'INT', default: 0 },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_PRODUCT_DETAILS: {
    name: 'purchase_product_details',
    table_type: 'purchase-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      purchase_request_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_requests',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'products', field: 'id', onDelete: 'RESTRICT' },
      },
      qty: { type: 'INT', default: 1 },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: { type: 'DECIMAL(12,2)' },
      details: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_PRODUCT_IMAGES: {
    name: 'purchase_product_images',
    table_type: 'purchase-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      purchase_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_product_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_url: { type: 'TEXT', notNull: true },
      image_name: { type: 'VARCHAR(255)', notNull: true },
      display_order: { type: 'INT', default: 0 },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_SERVICE_DETAILS: {
    name: 'purchase_service_details',
    table_type: 'purchase-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      purchase_request_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_requests',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      supplier_id: {
        type: 'VARCHAR(36)',
        references: { table: 'suppliers', field: 'id', onDelete: 'SET NULL' },
      },
      service_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_services',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      qty: { type: 'INT', default: 1 },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: { type: 'DECIMAL(12,2)' },
      details: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_SERVICE_IMAGES: {
    name: 'purchase_service_images',
    table_type: 'purchase-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      purchase_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_service_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_url: { type: 'TEXT', notNull: true },
      image_name: { type: 'VARCHAR(255)', notNull: true },
      display_order: { type: 'INT', default: 0 },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  AP_INVOICES: {
    name: 'ap_invoices',
    table_type: 'ap-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      remark: { type: 'TEXT' },
      supplier_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'suppliers', field: 'id', onDelete: 'RESTRICT' },
      },
      supplier_address_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'supplier_addresses',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  API_SHIPPING_DETAILS: {
    name: 'api_shipping_details',
    table_type: 'ap-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      ap_invoice_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'ap_invoices', field: 'id', onDelete: 'CASCADE' },
      },
      purchase_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_shipping_details',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      paid: { type: 'BOOLEAN', default: false },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  API_SHIPPING_FILES: {
    name: 'api_shipping_files',
    table_type: 'ap-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      api_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'api_shipping_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_name: { type: 'VARCHAR(255)', notNull: true },
      file_url: { type: 'TEXT', notNull: true },
      display_order: { type: 'INT', default: 0 },
      file_type: { type: 'VARCHAR(100)' },
      description: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  API_PRODUCT_DETAILS: {
    name: 'api_product_details',
    table_type: 'ap-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      ap_invoice_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'ap_invoices', field: 'id', onDelete: 'CASCADE' },
      },
      purchase_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_product_details',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      paid: { type: 'BOOLEAN', default: false },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  API_PRODUCT_FILES: {
    name: 'api_product_files',
    table_type: 'ap-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      api_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'api_product_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_name: { type: 'VARCHAR(255)', notNull: true },
      file_url: { type: 'TEXT', notNull: true },
      display_order: { type: 'INT', default: 0 },
      file_type: { type: 'VARCHAR(100)' },
      description: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  API_SERVICE_DETAILS: {
    name: 'api_service_details',
    table_type: 'ap-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      ap_invoice_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: { table: 'ap_invoices', field: 'id', onDelete: 'CASCADE' },
      },
      purchase_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_service_details',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      paid: { type: 'BOOLEAN', default: false },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  API_SERVICE_FILES: {
    name: 'api_service_files',
    table_type: 'ap-data',
    fields: {
      id: { type: 'VARCHAR(36)', primaryKey: true },
      api_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'api_service_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_name: { type: 'VARCHAR(255)', notNull: true },
      file_url: { type: 'TEXT', notNull: true },
      display_order: { type: 'INT', default: 0 },
      file_type: { type: 'VARCHAR(100)' },
      description: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
};

// Keep TABLE_MASTER organized as: master tables first, then data tables.
// Relative order inside each group follows the original declaration order.
const getTableOrderRank = (tableType = '') => {
  if (tableType.endsWith('-master')) return 0;
  if (tableType.endsWith('-data')) return 1;
  return 2;
};

export const TABLE_MASTER = Object.fromEntries(
  Object.entries(TABLE_MASTER_RAW)
    .map(([key, value], index) => ({ key, value, index }))
    .sort((a, b) => {
      const rankDiff =
        getTableOrderRank(a.value.table_type) -
        getTableOrderRank(b.value.table_type);

      if (rankDiff !== 0) return rankDiff;
      return a.index - b.index;
    })
    .map(({ key, value }) => [key, value]),
);

/**
 * Helper function to generate SQL for creating a table based on its definition
 * @param {Object} tableDefinition - Table definition from TABLE_MASTER
 * @returns {string} SQL statement for creating the table
 */
export const generateCreateTableSQL = (tableDefinition) => {
  const { name, fields, constraints = {} } = tableDefinition;

  // Start building the SQL statement
  let sql = `CREATE TABLE IF NOT EXISTS ${name} (\n`;

  // Add field definitions
  const fieldDefinitions = [];
  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    let fieldSql = `  ${fieldName} ${fieldDef.type}`;

    // Add constraints
    if (fieldDef.primaryKey) {
      fieldSql += ' PRIMARY KEY';
    }
    if (fieldDef.autoIncrement) {
      fieldSql += ' AUTO_INCREMENT';
    }
    if (fieldDef.notNull) {
      fieldSql += ' NOT NULL';
    }
    if (fieldDef.unique) {
      fieldSql += ' UNIQUE';
    }
    if (fieldDef.default !== undefined) {
      if (
        typeof fieldDef.default === 'string' &&
        !fieldDef.default.includes('CURRENT_TIMESTAMP')
      ) {
        fieldSql += ` DEFAULT '${fieldDef.default}'`;
      } else {
        fieldSql += ` DEFAULT ${fieldDef.default}`;
      }
    }

    fieldDefinitions.push(fieldSql);
  }

  // Add table-level constraints
  for (const [constraintName, constraintDef] of Object.entries(constraints)) {
    if (constraintDef.type === 'PRIMARY KEY') {
      fieldDefinitions.push(
        `  PRIMARY KEY (${constraintDef.fields.join(', ')})`,
      );
    } else if (constraintDef.type === 'UNIQUE') {
      fieldDefinitions.push(
        `  CONSTRAINT ${constraintName} UNIQUE (${constraintDef.fields.join(
          ', ',
        )})`,
      );
    }
  }

  // Add foreign key references
  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    if (fieldDef.references) {
      const { table, field, onDelete = 'RESTRICT' } = fieldDef.references;
      fieldDefinitions.push(
        `  FOREIGN KEY (${fieldName}) REFERENCES ${table}(${field}) ON DELETE ${onDelete}`,
      );
    }
  }

  // Complete the SQL statement
  sql += fieldDefinitions.join(',\n');
  sql +=
    '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';

  return sql;
};

/**
 * Get all table names as an array
 * @returns {string[]} Array of table names
 */
export const getAllTableNames = () => {
  return Object.values(TABLE_MASTER).map((table) => table.name);
};

/**
 * Get field definitions for a specific table
 * @param {string} tableName - Name of the table
 * @returns {Object|null} Field definitions or null if table not found
 */
export const getTableFields = (tableName) => {
  for (const table of Object.values(TABLE_MASTER)) {
    if (table.name === tableName) {
      return table.fields;
    }
  }
  return null;
};
