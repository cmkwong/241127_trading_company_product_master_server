// Auto-generated from models/tables.js.
export const SUPPLIERS_TABLE_DEFINITIONS = {
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
      status: {
        type: 'VARCHAR(50)',
        notNull: true,
        description: 'Status of the supplier, default is active',
        default: 'active',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional notes about the supplier',
      },
      score: {
        type: 'FLOAT',
        description: 'Score related to the supplier, 1-10,',
        default: 1,
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
      unique_supplier_code: {
        type: 'UNIQUE',
        fields: ['supplier_code'],
      },
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
        references: {
          table: 'suppliers',
          field: 'id',
          onDelete: 'CASCADE',
        },
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
        references: {
          table: 'suppliers',
          field: 'id',
          onDelete: 'CASCADE',
        },
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
    constraints: {},
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
        references: {
          table: 'suppliers',
          field: 'id',
          onDelete: 'CASCADE',
        },
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
        references: {
          table: 'suppliers',
          field: 'id',
          onDelete: 'CASCADE',
        },
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
    constraints: {},
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
        references: {
          table: 'suppliers',
          field: 'id',
          onDelete: 'CASCADE',
        },
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
  SUPPLIER_SERVICE_FILES: {
    name: 'supplier_service_files',
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
      file_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'File name',
      },
      file_url: {
        type: 'TEXT',
        notNull: true,
        description: 'URL to service file',
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
