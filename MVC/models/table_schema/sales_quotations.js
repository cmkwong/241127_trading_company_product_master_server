// Auto-generated from models/tables.js.
export const SALES_QUOTATIONS_TABLE_DEFINITIONS = {
  SALES_QUOTATIONS: {
    name: 'sales_quotations',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
      doc_type: {
        type: 'VARCHAR(50)',
        description: 'Document type, e.g., sales_quotation',
      },
      base_type: {
        type: 'VARCHAR(50)',
        description: 'Base document type, e.g., sales_quotation',
      },
      base_entry: {
        type: 'VARCHAR(36)',
        description: 'Reference to the base document entry (if any)',
      },
      status: {
        type: 'VARCHAR(50)',
        default: 'draft',
        description: 'Status of the sales quotation',
      },
      customer_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'customers',
          field: 'id',
          onDelete: 'RESTRICT',
        },
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
      header_proforma_percent: {
        type: 'DECIMAL(5,3)',
        description: 'Header proforma percentage',
      },
      posting_at: {
        type: 'TIMESTAMP',
        description: 'Posting date of the sales quotation',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      },
      remark: {
        type: 'TEXT',
        description: 'Remark',
      },
    },
  },
  SALES_DOCS: {
    name: 'sales_docs',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
      sales_quotation_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_quotations',
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
  SALES_SHIPPING_DETAILS: {
    name: 'sales_shipping_details',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
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
      length: {
        type: 'DECIMAL(10,3)',
      },
      width: {
        type: 'DECIMAL(10,3)',
      },
      height: {
        type: 'DECIMAL(10,3)',
      },
      qty: {
        type: 'INT',
        default: 0,
      },
      weight: {
        type: 'DECIMAL(10,3)',
      },
      chargeable_divisor: {
        type: 'DECIMAL(12,3)',
        default: 6000,
        description: 'Volumetric divisor for chargeable weight calculation',
      },
      min_chargeable_weight: {
        type: 'DECIMAL(10,3)',
        default: 12,
        description: 'Minimum chargeable weight per carton in kg',
      },
      details: {
        type: 'TEXT',
      },
      remark: {
        type: 'TEXT',
        description: 'Internal remark (not for print)',
      },
      base_line_type: {
        type: 'VARCHAR(50)',
        description: 'Source line type (product, shipping, service)',
      },
      base_line: {
        type: 'VARCHAR(36)',
        description: 'Source line id in the matching line table',
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
  SALES_SHIPPING_PRICES: {
    name: 'sales_shipping_prices',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
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
        references: {
          table: 'suppliers',
          field: 'id',
          onDelete: 'SET NULL',
        },
      },
      shipping_method_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_shipping_method',
          field: 'id',
          onDelete: 'SET NULL',
        },
        description: 'Reference to master_shipping_method.id',
      },
      incoterms: {
        type: 'VARCHAR(50)',
        description: 'Incoterm code selected from master_incoterms.code',
      },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      cost_currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: {
        type: 'DECIMAL(12,3)',
      },
      discount_percent: {
        type: 'DECIMAL(5,2)',
        default: 0,
        description: 'Discount percentage applied to sales price',
      },
      cost_price: {
        type: 'DECIMAL(12,3)',
      },
      delivery_lead_time_from: {
        type: 'INT',
        description: 'Delivery lead-time lower bound in days',
      },
      delivery_lead_time_to: {
        type: 'INT',
        description: 'Delivery lead-time upper bound in days',
      },
      details: {
        type: 'TEXT',
      },
      override_shipping_method_name: {
        type: 'VARCHAR(255)',
        description: 'Override shipping method name used in quotation printout',
      },
      remark: {
        type: 'TEXT',
        description: 'Internal remark (not for print)',
      },
      selected: {
        type: 'BOOLEAN',
        default: false,
        description: 'Selected option for shipping',
      },
      ari_selected: {
        type: 'BOOLEAN',
        default: true,
        description: 'Selected for AR invoice printing',
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
  SALES_SHIPPING_IMAGES: {
    name: 'sales_shipping_images',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
      sales_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_shipping_details',
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
  SALES_SHIPPING_INTERNAL_IMAGES: {
    name: 'sales_shipping_internal_images',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
      sales_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_shipping_details',
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
  SALES_SHIPPING_INTERNAL_FILES: {
    name: 'sales_shipping_internal_files',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
      sales_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_shipping_details',
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
  SALES_SHIPPING_PRICE_IMAGES: {
    name: 'sales_shipping_price_images',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
      sales_shipping_price_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_shipping_prices',
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
  SALES_SHIPPING_PRICE_INTERNAL_IMAGES: {
    name: 'sales_shipping_price_internal_images',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
      sales_shipping_price_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_shipping_prices',
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
  SALES_SHIPPING_PRICE_INTERNAL_FILES: {
    name: 'sales_shipping_price_internal_files',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID',
      },
      sales_shipping_price_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_shipping_prices',
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
  SALES_PRODUCT_DETAILS: {
    name: 'sales_product_details',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
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
      cost_currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: {
        type: 'DECIMAL(12,3)',
      },
      discount_percent: {
        type: 'DECIMAL(5,2)',
        default: 0,
        description: 'Discount percentage applied to sales price',
      },
      cost_price: {
        type: 'DECIMAL(12,3)',
      },
      details: {
        type: 'TEXT',
      },
      override_product_name: {
        type: 'VARCHAR(255)',
        description: 'Override product name used in quotation printout',
      },
      remark: {
        type: 'TEXT',
        description: 'Internal remark (not for print)',
      },
      selected: {
        type: 'BOOLEAN',
        default: true,
        description: 'Selected option for product detail',
      },
      ari_selected: {
        type: 'BOOLEAN',
        default: true,
        description: 'Selected for AR invoice printing',
      },
      base_line_type: {
        type: 'VARCHAR(50)',
        description: 'Source line type (product, shipping, service)',
      },
      base_line: {
        type: 'VARCHAR(36)',
        description: 'Source line id in the matching line table',
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
  SALES_PRODUCT_DETAIL_IMAGES: {
    name: 'sales_product_detail_images',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      sales_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_product_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      image_url: {
        type: 'TEXT',
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
  SALES_PRODUCT_DETAIL_INTERNAL_IMAGES: {
    name: 'sales_product_detail_internal_images',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      sales_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_product_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      image_url: {
        type: 'TEXT',
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
  SALES_PRODUCT_DETAIL_INTERNAL_FILES: {
    name: 'sales_product_detail_internal_files',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      sales_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_product_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      file_url: {
        type: 'TEXT',
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
  SALES_SERVICE_DETAILS: {
    name: 'sales_service_details',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
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
        references: {
          table: 'suppliers',
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
      cost_currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      price: {
        type: 'DECIMAL(12,3)',
      },
      discount_percent: {
        type: 'DECIMAL(5,2)',
        default: 0,
        description: 'Discount percentage applied to sales price',
      },
      cost_price: {
        type: 'DECIMAL(12,3)',
      },
      details: {
        type: 'TEXT',
      },
      override_service_name: {
        type: 'VARCHAR(255)',
        description: 'Override service name used in quotation printout',
      },
      remark: {
        type: 'TEXT',
        description: 'Internal remark (not for print)',
      },
      selected: {
        type: 'BOOLEAN',
        default: true,
        description: 'Selected option for service detail',
      },
      ari_selected: {
        type: 'BOOLEAN',
        default: true,
        description: 'Selected for AR invoice printing',
      },
      base_line_type: {
        type: 'VARCHAR(50)',
        description: 'Source line type (product, shipping, service)',
      },
      base_line: {
        type: 'VARCHAR(36)',
        description: 'Source line id in the matching line table',
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
  SALES_SERVICE_DETAIL_INTERNAL_IMAGES: {
    name: 'sales_service_detail_internal_images',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      sales_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_service_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      image_url: {
        type: 'TEXT',
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
  SALES_SERVICE_DETAIL_INTERNAL_FILES: {
    name: 'sales_service_detail_internal_files',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      sales_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_service_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      file_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      file_url: {
        type: 'TEXT',
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
  SALES_SERVICE_DETAIL_IMAGES: {
    name: 'sales_service_detail_images',
    table_type: 'sales-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      sales_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'sales_service_details',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      image_name: {
        type: 'VARCHAR(255)',
        notNull: true,
      },
      image_url: {
        type: 'TEXT',
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
