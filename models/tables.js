// Centralized table and field definitions
export const TABLE_MASTER = {
  // Main tables
  PRODUCTS: {
    name: 'products',
    table_type: 'data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      product_id: {
        type: 'VARCHAR(12)',
        notNull: true,
        unique: true,
        description: 'Product code identifier',
      },
      icon_url: {
        type: 'VARCHAR(255)',
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
  MASTER_PRODUCT_IMAGE_TYPES: {
    name: 'master_product_image_types',
    table_type: 'master',
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
    },
    constraints: {
      unique_product_image_type: { type: 'UNIQUE', fields: ['name'] },
    },
  },
  PRODUCT_IMAGES: {
    name: 'product_images',
    table_type: 'data',
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
      image_url: {
        type: 'VARCHAR(255)',
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
    },
  },

  MASTER_PRODUCT_NAME_TYPES: {
    name: 'master_product_name_types',
    table_type: 'master',
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
    },
    constraints: {
      unique_name_type: { type: 'UNIQUE', fields: ['name'] },
    },
  },

  PRODUCT_NAMES: {
    name: 'product_names',
    table_type: 'data',
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
    table_type: 'master',
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
    },
  },

  PRODUCT_CATEGORIES: {
    name: 'product_categories',
    table_type: 'data',
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
    table_type: 'data',
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
    },
  },

  PRODUCT_CUSTOMIZATION_IMAGES: {
    name: 'product_customization_images',
    table_type: 'data',
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
      image_url: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'URL to customization image',
      },
      display_order: {
        type: 'VARCHAR(36)',
        default: 0,
        description: 'Order for display purposes',
      },
    },
  },

  PRODUCT_LINKS: {
    name: 'product_links',
    table_type: 'data',
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
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'URL link related to product',
      },
      remark: { type: 'TEXT', description: 'Additional notes about the link' },
      link_date: { type: 'DATE', description: 'Date associated with the link' },
    },
  },

  PRODUCT_LINK_IMAGES: {
    name: 'product_link_images',
    table_type: 'data',
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
      image_url: {
        type: 'VARCHAR(255)',
        notNull: true,
        description: 'URL to link-related image',
      },
      display_order: {
        type: 'VARCHAR(36)',
        default: 0,
        description: 'Order for display purposes',
      },
    },
  },

  PRODUCT_ALIBABA_IDS: {
    name: 'product_alibaba_ids',
    table_type: 'data',
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
        type: 'VARCHAR(255)',
        description: 'URL to Alibaba product page',
      },
    },
  },

  MASTER_PACKING_TYPES: {
    name: 'master_packing_types',
    table_type: 'master',
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
    },
    constraints: {
      unique_packing_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },

  PRODUCT_PACKINGS: {
    name: 'product_packings',
    table_type: 'data',
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
    },
  },

  MASTER_CERTIFICATE_TYPES: {
    name: 'master_certificate_types',
    table_type: 'master',
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
    },
    constraints: {
      unique_certificate_type_name: { type: 'UNIQUE', fields: ['name'] },
    },
  },

  PRODUCT_CERTIFICATES: {
    name: 'product_certificates',
    table_type: 'data',
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
    },
  },

  PRODUCT_CERTIFICATE_FILES: {
    name: 'product_certificate_files',
    table_type: 'data',
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
      file_url: {
        type: 'VARCHAR(255)',
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
        `  PRIMARY KEY (${constraintDef.fields.join(', ')})`
      );
    } else if (constraintDef.type === 'UNIQUE') {
      fieldDefinitions.push(
        `  CONSTRAINT ${constraintName} UNIQUE (${constraintDef.fields.join(
          ', '
        )})`
      );
    }
  }

  // Add foreign key references
  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    if (fieldDef.references) {
      const { table, field, onDelete = 'RESTRICT' } = fieldDef.references;
      fieldDefinitions.push(
        `  FOREIGN KEY (${fieldName}) REFERENCES ${table}(${field}) ON DELETE ${onDelete}`
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
