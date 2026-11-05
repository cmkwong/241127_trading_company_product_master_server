export const CATALOGS_TABLE_DEFINITIONS = {
  CATALOGS: {
    name: 'catalogs',
    table_type: 'catalog-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      catalog_name: {
        type: 'VARCHAR(255)',
        description: 'Name of the catalog',
      },
      display_header: {
        type: 'VARCHAR(255)',
        description: 'Header text to display for the catalog',
      },
      remark: {
        type: 'TEXT',
        description: 'Additional remarks or notes for the catalog',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Timestamp when the catalog was created',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Timestamp when the catalog was last updated',
      },
    },
  },
  CATALOG_PRODUCT_ROWS: {
    name: 'catalog_product_rows',
    table_type: 'catalog-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      catalog_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'catalogs',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'ID of the catalog this row belongs to',
      },
      product_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'products',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'ID of the product in this row',
      },
      image_url: {
        type: 'VARCHAR(255)',
        description: 'URL of the image for the product in this row',
      },
      display_order: {
        type: 'INT',
        description: 'Display order of the product in the catalog',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Timestamp when the row was created',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Timestamp when the row was last updated',
      },
    },
  },
  CATALOG_PRODUCT_ROW_IMAGES: {
    name: 'catalog_product_row_images',
    table_type: 'catalog-data',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      catalog_product_row_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'catalog_product_rows',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'ID of the catalog product row this image belongs to',
      },
      image_url: {
        type: 'VARCHAR(255)',
        description: 'URL of the image for the catalog product row',
      },
      display_order: {
        type: 'INT',
        description: 'Display order of the image for the catalog product row',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Timestamp when the image was created',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Timestamp when the image was last updated',
      },
    },
  },
  CATALOG_PRODUCT_ROW_ATTRIBUTE_DISPLAYS: {
    name: 'catalog_product_row_attribute_displays',
    table_type: 'catalog-data',
    description: 'Displays of which attributes for catalog product rows',
    fields: {
      id: {
        type: 'VARCHAR(36)',
        primaryKey: true,
        description: 'UUID primary key',
      },
      catalog_product_row_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'catalog_product_rows',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'ID of the catalog product row this attribute belongs to',
      },
      attribute_id: {
        type: 'VARCHAR(36)',
        references: {
          table: 'master_product_attributes',
          field: 'id',
          onDelete: 'CASCADE',
        },
        description: 'ID of the attribute for the catalog product row',
      },
      created_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP',
        description: 'Timestamp when the attribute was created',
      },
      updated_at: {
        type: 'TIMESTAMP',
        default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        description: 'Timestamp when the attribute was last updated',
      },
    },
  },
};
