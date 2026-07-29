// Auto-generated from models/tables.js.
export const MASTER_TABLE_DEFINITIONS = {
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
      unique_currency_code: {
        type: 'UNIQUE',
        fields: ['code'],
      },
    },
  },
  MASTER_COUNTRIES: {
    name: 'master_countries',
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
        description: 'Country name',
      },
      code: {
        type: 'VARCHAR(10)',
        notNull: false,
        description: 'Country code (e.g., US, FR)',
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
  MASTER_PET_TYPES: {
    name: 'master_pet_types',
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
        description: 'Pet type name',
      },
      description: {
        type: 'TEXT',
        description: 'Pet type description',
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
      unique_pet_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
      },
    },
  },
  MASTER_COMPANY_INFO: {
    name: 'master_company_info',
    table_type: 'sales-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      logo_icon_url: {
        type: 'TEXT',
        description: 'Company logo icon URL',
      },
      logo_icon_name: {
        type: 'VARCHAR(255)',
        description: 'Company logo icon file name',
      },
      company_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Company display name',
      },
      company_address: {
        type: 'TEXT',
        description: 'Company address shown on quotation',
      },
      contact_person: {
        type: 'VARCHAR(255)',
        description: 'Primary contact person name',
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
  MASTER_INCOTERMS: {
    name: 'master_incoterms',
    table_type: 'sales-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      code: {
        type: 'VARCHAR(20)',
        notNull: true,
        description: 'Incoterm code (e.g., EXW, FOB, CIF)',
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
        description: 'Incoterm display name',
      },
      description: {
        type: 'TEXT',
        description: 'Incoterm description',
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
      unique_incoterm_code: {
        type: 'UNIQUE',
        fields: ['code'],
      },
    },
  },
  MASTER_SHIPPING_METHOD: {
    name: 'master_shipping_method',
    table_type: 'sales-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      name: {
        type: 'VARCHAR(150)',
        notNull: true,
        description: 'Shipping method name',
      },
      description: {
        type: 'TEXT',
        description: 'Shipping method description',
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
      unique_shipping_method_name: {
        type: 'UNIQUE',
        fields: ['name'],
      },
    },
  },
  MASTER_EXCHANGE_RATE_HKD: {
    name: 'master_exchange_rate_hkd',
    table_type: 'sales-master',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      HKD: {
        type: 'DECIMAL(16,8)',
        notNull: true,
        default: 1,
        description: 'HKD base rate',
      },
      USD: {
        type: 'DECIMAL(16,8)',
        notNull: true,
        description: 'USD per HKD',
      },
      CNY: {
        type: 'DECIMAL(16,8)',
        notNull: true,
        description: 'CNY per HKD',
      },
      EUR: {
        type: 'DECIMAL(16,8)',
        notNull: true,
        description: 'EUR per HKD',
      },
      GBP: {
        type: 'DECIMAL(16,8)',
        notNull: true,
        description: 'GBP per HKD',
      },
      Date: {
        type: 'DATE',
        notNull: true,
        description: 'Exchange rate effective date',
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
      unique_exchange_rate_hkd_date: {
        type: 'UNIQUE',
        fields: ['Date'],
      },
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
      unique_size_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_color_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_keyword_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
          onDelete: 'SET NULL',
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
      unique_product_image_type: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_name_type: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_packing_name: {
        type: 'UNIQUE',
        fields: ['name'],
      },
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
      unique_reliability_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_certificate_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_supplier_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_address_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_contact_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_supplier_link_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
      },
    },
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
      unique_customer_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_customer_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
      unique_customer_image_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
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
  ARI_SHIPPING_DETAILS: {
    name: 'ari_shipping_details',
    table_type: 'ar-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      ar_invoice_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'ar_invoices',
          field: 'id',
          onDelete: 'CASCADE',
        },
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
      received: {
        type: 'BOOLEAN',
        default: false,
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
  ARI_SHIPPING_FILES: {
    name: 'ari_shipping_files',
    table_type: 'ar-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      ari_shipping_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'ari_shipping_details',
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
      file_type: {
        type: 'VARCHAR(100)',
      },
      description: {
        type: 'TEXT',
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
  ARI_PRODUCT_DETAILS: {
    name: 'ari_product_details',
    table_type: 'ar-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      ar_invoice_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'ar_invoices',
          field: 'id',
          onDelete: 'CASCADE',
        },
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
      received: {
        type: 'BOOLEAN',
        default: false,
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
  ARI_PRODUCT_FILES: {
    name: 'ari_product_files',
    table_type: 'ar-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      ari_product_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'ari_product_details',
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
      file_type: {
        type: 'VARCHAR(100)',
      },
      description: {
        type: 'TEXT',
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
  ARI_SERVICE_DETAILS: {
    name: 'ari_service_details',
    table_type: 'ar-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      ar_invoice_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'ar_invoices',
          field: 'id',
          onDelete: 'CASCADE',
        },
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
      received: {
        type: 'BOOLEAN',
        default: false,
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
  ARI_SERVICE_FILES: {
    name: 'ari_service_files',
    table_type: 'ar-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      ari_service_detail_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'ari_service_details',
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
      file_type: {
        type: 'VARCHAR(100)',
      },
      description: {
        type: 'TEXT',
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
  MASTER_INVOICE_TYPES: {
    name: 'master_invoice_types',
    table_type: 'master-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
      },
      code: {
        type: 'VARCHAR(50)',
        unique: true,
        notNull: true,
      },
      description: {
        type: 'TEXT',
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
  MASTER_MADEOF_TYPES: {
    name: 'master_madeof_types',
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
        description: 'Made of type name',
      },
      description: {
        type: 'VARCHAR(255)',
        description: 'Made of type description',
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
      unique_madeof_type_name: {
        type: 'UNIQUE',
        fields: ['name'],
      },
    },
  },
};
