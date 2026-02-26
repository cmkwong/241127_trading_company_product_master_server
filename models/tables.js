// Centralized table and field definitions
export const TABLE_MASTER = {
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
        fields: ['product_id', 'name_type_id'],
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
      link: {
        type: 'TEXT',
        notNull: true,
        description: 'URL link related to product',
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
      length: {
        type: 'DECIMAL(10,2)',
        notNull: true,
        description: 'Length dimension',
      },
      width: {
        type: 'DECIMAL(10,2)',
        notNull: true,
        description: 'Width dimension',
      },
      height: {
        type: 'DECIMAL(10,2)',
        notNull: true,
        description: 'Height dimension',
      },
      quantity: {
        type: 'VARCHAR(36)',
        notNull: true,
        default: 1,
        description: 'Quantity in this packing',
      },
      weight: {
        type: 'DECIMAL(10,2)',
        notNull: true,
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

  PRODUCT_PACKING_IMAGES: {
    name: 'product_packing_images',
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
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Image name',
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to packing image',
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
      supplier_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
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
    constraints: {
      unique_supplier_code: { type: 'UNIQUE', fields: ['supplier_code'] },
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
  MASTER_SERVICE_TYPES: {
    name: 'master_service_types',
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
        description: 'Service type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Service type description',
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
      unique_service_type_name: { type: 'UNIQUE', fields: ['name'] },
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
      service_type_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_service_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_service_types.id',
      },
      description: {
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
};

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
