// Auto-generated from models/tables.js.
export const PURCHASE_REQUESTS_TABLE_DEFINITIONS = {
  PURCHASE_REQUESTS: {
    name: 'purchase_requests',
    table_type: 'purchase-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      to_order: {
        type: 'BOOLEAN',
        default: false,
      },
      status: {
        type: 'VARCHAR(50)',
        default: 'draft',
      },
      remark: {
        type: 'TEXT',
      },
      sales_quotation_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'sales_quotations',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      supplier_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'suppliers',
          field: 'id',
          onDelete: 'RESTRICT',
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
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
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
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      purchase_request_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_requests',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      sales_shipping_detail_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'sales_shipping_details',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      address_text: {
        type: 'TEXT',
      },
      length: {
        type: 'DECIMAL(10,2)',
      },
      width: {
        type: 'DECIMAL(10,2)',
      },
      height: {
        type: 'DECIMAL(10,2)',
      },
      quantity: {
        type: 'INT',
        default: 0,
      },
      weight: {
        type: 'DECIMAL(10,2)',
      },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: {
        type: 'DECIMAL(12,2)',
      },
      api_selected: {
        type: 'BOOLEAN',
        default: true,
        description: 'Whether this row is selected for AP invoice layout',
      },
      details: {
        type: 'TEXT',
      },
      remark: {
        type: 'TEXT',
        description: 'Internal remark (not for print)',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
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
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      purchase_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_shipping_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      display_order: {
        type: 'INT',
        default: 0,
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_SHIPPING_FILES: {
    name: 'purchase_shipping_files',
    table_type: 'purchase-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      purchase_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_shipping_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_url: {
        type: 'TEXT',
        notNull: true,
      },
      file_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      display_order: {
        type: 'INT',
        default: 0,
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
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
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      purchase_request_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_requests',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      sales_product_detail_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'sales_product_details',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      qty: {
        type: 'INT',
        default: 1,
      },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: {
        type: 'DECIMAL(12,2)',
      },
      api_selected: {
        type: 'BOOLEAN',
        default: true,
        description: 'Whether this row is selected for AP invoice layout',
      },
      details: {
        type: 'TEXT',
      },
      remark: {
        type: 'TEXT',
        description: 'Internal remark (not for print)',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
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
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      purchase_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_product_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      display_order: {
        type: 'INT',
        default: 0,
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_PRODUCT_FILES: {
    name: 'purchase_product_files',
    table_type: 'purchase-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      purchase_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_product_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_url: {
        type: 'TEXT',
        notNull: true,
      },
      file_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      display_order: {
        type: 'INT',
        default: 0,
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
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
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
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
        references: {
          table: 'suppliers',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      sales_service_detail_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'sales_service_details',
          field: 'id',
          onDelete: 'SET NULL',
        },
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
      qty: {
        type: 'INT',
        default: 1,
      },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: {
        type: 'DECIMAL(12,2)',
      },
      api_selected: {
        type: 'BOOLEAN',
        default: true,
        description: 'Whether this row is selected for AP invoice layout',
      },
      details: {
        type: 'TEXT',
      },
      remark: {
        type: 'TEXT',
        description: 'Internal remark (not for print)',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
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
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      purchase_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_service_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_url: {
        type: 'TEXT',
        notNull: true,
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      display_order: {
        type: 'INT',
        default: 0,
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
  PURCHASE_SERVICE_FILES: {
    name: 'purchase_service_files',
    table_type: 'purchase-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      purchase_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'purchase_service_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_url: {
        type: 'TEXT',
        notNull: true,
      },
      file_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      display_order: {
        type: 'INT',
        default: 0,
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
    },
  },
};
