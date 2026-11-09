export const COMPANYS_TABLE_DEFINITIONS = {
  COMPANYS: {
    name: 'companys',
    table_type: 'company-data',
    description: 'Table for storing company information',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      name: {
        type: 'VARCHAR(255)',
        description: 'Name of the company',
      },
      icon_name: {
        type: 'VARCHAR(255)',
        description: 'company icon file name',
      },
      icon_url: {
        type: 'TEXT',
        description: 'URL to company icon image',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional remarks or notes for the company',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Timestamp when the company was created',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Timestamp when the company was last updated',
      },
    },
  },
  COMPANY_ADDRESS: {
    name: 'company_address',
    table_type: 'company-data',
    description: 'Table for storing company address information',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      company_id: {
        type: 'VARCHAR(36)',
        description: 'ID of the company',
        references: {
          table: 'companys',
          field: 'id',
          onDelete: 'RESTRICT',
        },
      },
      contact_name: {
        type: 'VARCHAR(150)',
        description: 'Name of the contact person',
      },
      phone_number: {
        type: 'VARCHAR(30)',
        description: 'Phone number of the contact person',
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
      is_default: {
        type: 'BOOLEAN',
        default: false,
        description: 'Indicates if this is the default address for the company',
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
};
