// Auto-generated from models/tables.js.
export const USERS_TABLE_DEFINITIONS = {
  USERS: {
    name: 'users',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'Primary key for the users table',
      },
      user_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Username of the user',
      },
      email: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Email address of the user',
      },
      display_name: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Display name of the user',
      },
      country_calling_code: {
        type: 'VARCHAR(36)',
        description: 'Country calling code of the user',
        references: {
          table: 'master_country_calling_code',
          field: 'id',
          onDelete: 'CASCADE',
        },
      },
      phone_number: {
        type: 'VARCHAR(30)',
        description: 'Phone number of the user',
      },
      user_icon: {
        type: 'VARCHAR(500)',
        description: 'URL or path to the user icon',
      },
      status: {
        type: 'VARCHAR(50)',
        description: 'Status of the user',
        default: 'active',
      },
      email_verified_at: {
        type: 'TIMESTAMP',
        description: "Timestamp when the user's email was verified",
      },
      last_login_at: {
        type: 'TIMESTAMP',
        description: 'Timestamp when the user last logged in',
      },
      created_at: {
        type: 'TIMESTAMP',
        description: 'Timestamp when the user was created',
      },
      updated_at: {
        type: 'TIMESTAMP',
        description: 'Timestamp when the user was last updated',
      },
    },
  },
  USER_AUTHS: {
    name: 'user_auths',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      user_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'users',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to users.id',
      },
      password_hash: {
        type: 'TEXT',
        notNull: true,
        description: 'bcrypt encrypted - Hashed password of the user',
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
      unique_user_auth: {
        type: 'UNIQUE',
        fields: ['user_id'],
      },
    },
  },
  USER_ADDRESSES: {
    name: 'user_addresses',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      user_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'users',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to users.id',
      },
      address_type_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_address_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_address_types.id',
      },
      recipient_name: {
        type: 'VARCHAR(150)',
        notNull: true,
        description: 'Person receiving the shipment',
      },
      phone_number: {
        type: 'VARCHAR(30)',
        description: 'Delivery contact number',
      },
      company_name: {
        type: 'VARCHAR(150)',
        description: 'Optional company name (useful for B2B)',
      },
      address_line_1: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'Primary address line',
      },
      address_line_2: {
        type: 'VARCHAR(255)',
        description: 'Secondary address line',
      },
      address_line_3: {
        type: 'VARCHAR(255)',
        description: 'Tertiary address line',
      },
      city: {
        type: 'VARCHAR(100)',
        description: 'City',
      },
      state: {
        type: 'VARCHAR(100)',
        description: 'State / province / region',
      },
      postal_code: {
        type: 'VARCHAR(20)',
        description: 'Postal code (renamed from zip_code)',
      },
      country_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_countries',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_countries.id',
      },
      is_default: {
        type: 'BOOLEAN',
        default: false,
        description: 'Whether this is the default address for the user',
      },
      delivery_instructions: {
        type: 'VARCHAR(500)',
        description: 'Optional delivery instructions',
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
  USER_CARTS: {
    name: 'user_carts',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      user_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'users',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to users.id',
      },
      status: {
        type: 'VARCHAR(20)',
        default: 'active',
        description: 'Cart status: active, converted, abandoned',
      },
      currency: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_currencies.id',
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
  USER_CART_ITEMS: {
    name: 'user_cart_items',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      cart_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'user_carts',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to user_carts.id',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to products.id',
      },
      color_type_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_color_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_color_types.id',
      },
      capacity_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_capacity_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_capacity_types.id',
      },
      size_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_size_types',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_size_types.id',
      },
      qty: {
        type: 'INT',
        notNull: true,
        description: 'Quantity of the product the user wants to purchase',
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
  USER_FAVOURITES: {
    name: 'user_favourites',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      user_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'users',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to users.id',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to products.id',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
    },
    constraints: {
      unique_user_favourite: {
        type: 'UNIQUE',
        fields: ['user_id', 'product_id'],
      },
    },
  },
  USER_PRODUCT_HISTORY: {
    name: 'user_product_history',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      user_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'users',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to users.id',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to products.id',
      },
      view_count: {
        type: 'INT UNSIGNED',
        default: 1,
        description: 'Number of times the user viewed the product',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'First view timestamp',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Most recent view timestamp',
      },
    },
    constraints: {
      unique_user_product_history: {
        type: 'UNIQUE',
        fields: ['user_id', 'product_id'],
      },
    },
  },
  USER_RFQS: {
    name: 'user_rfqs',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      user_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'users',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to users.id',
      },
      rfq_number: {
        type: 'VARCHAR(50)',
        notNull: true,
        description: 'Human-readable ID (e.g., RFQ-20260908-001)',
      },
      status: {
        type: 'VARCHAR(30)',
        default: 'draft',
        description: 'RFQ status: draft, submitted, processing, quoted, closed',
      },
      shipping_address_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'user_addresses',
          field: 'id',
          onDelete: 'SET NULL',
        },
        description: 'Reference to user_addresses.id (ship-to address)',
      },
      expected_delivery_date: {
        type: 'DATE',
        description: 'Date when the buyer needs the goods',
      },
      buyer_remarks: {
        type: 'TEXT',
        description: 'Overall message / requirements from the buyer',
      },
      sales_quotation_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'sales_quotations',
          field: 'id',
          onDelete: 'SET NULL',
        },
        description: 'Reference to sales_quotations.id (null until replied)',
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
      unique_rfq_number: {
        type: 'UNIQUE',
        fields: ['rfq_number'],
      },
    },
  },
  USER_RFQ_ITEMS: {
    name: 'user_rfq_items',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      rfq_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'user_rfqs',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to user_rfqs.id',
      },
      product_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to products.id',
      },
      target_qty: {
        type: 'INT',
        notNull: true,
        description: 'How many units the buyer wants to purchase',
      },
      target_price: {
        type: 'DECIMAL(12,2)',
        description: 'Optional target price the buyer is hoping to get',
      },
      currency_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_currencies',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_currencies.id',
      },
      customization_notes: {
        type: 'TEXT',
        description:
          'Customization requirements (e.g., OEM packaging, logo printing)',
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
      unique_rfq_item: {
        type: 'UNIQUE',
        fields: ['rfq_id', 'product_id'],
      },
    },
  },
  USER_RFQ_ATTACHMENTS: {
    name: 'user_rfq_attachments',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      rfq_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'user_rfqs',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to user_rfqs.id',
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
  USER_MEMBERSHIPS: {
    name: 'user_memberships',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      user_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'users',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to users.id',
      },
      tier_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'master_membership_tiers',
          field: 'id',
          onDelete: 'RESTRICT',
        },
        description: 'Reference to master_membership_tiers.id (e.g., V1, V2)',
      },
      growth_points: {
        type: 'INT',
        default: 0,
        description: 'Points accumulated to reach the next tier',
      },
      valid_until: {
        type: 'TIMESTAMP',
        description: 'Expiration date of the current tier',
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
      unique_user_membership: {
        type: 'UNIQUE',
        fields: ['user_id'],
      },
    },
  },
  USER_NOTIFICATIONS: {
    name: 'user_notifications',
    table_type: 'users-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      user_id: {
        type: 'VARCHAR(36)',
        notNull: true,
        references: {
          table: 'users',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'Reference to users.id',
      },
      type: {
        type: 'VARCHAR(30)',
        description:
          'Notification type (e.g., order_update, promotion, system)',
      },
      title: {
        type: 'VARCHAR(150)',
        description: 'Short title of the notification',
      },
      message: {
        type: 'TEXT',
        description: 'Full notification content',
      },
      is_read: {
        type: 'BOOLEAN',
        default: false,
        description: 'Whether the notification has been read',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp',
      },
    },
  },
};
