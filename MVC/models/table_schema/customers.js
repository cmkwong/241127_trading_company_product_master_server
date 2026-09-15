// Auto-generated from models/tables.js.
export const CUSTOMERS_TABLE_DEFINITIONS = {
  "CUSTOMERS": {
    "name": "customers",
    "table_type": "customers-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true,
        "description": "Auto-incremented primary key"
      },
      "customer_code": {
        "type": "VARCHAR(50)",
        "notNull": true,
        "description": "Unique code for the customer"
      },
      "remark": {
        "type": "TEXT",
        "description": "Additional notes about the customer"
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP",
        "description": "Creation timestamp"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "description": "Last update timestamp"
      }
    },
    "constraints": {
      "unique_customer_code": {
        "type": "UNIQUE",
        "fields": [
          "customer_code"
        ]
      }
    }
  },
  "CUSTOMER_NAMES": {
    "name": "customer_names",
    "table_type": "customers-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true,
        "description": "Auto-incremented primary key"
      },
      "customer_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "customers",
          "field": "id",
          "onDelete": "CASCADE"
        },
        "description": "Reference to customers.id"
      },
      "name_type_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "master_customer_name_types",
          "field": "id",
          "onDelete": "RESTRICT"
        },
        "description": "Reference to master_customer_name_types.id"
      },
      "name": {
        "type": "VARCHAR(255)",
        "notNull": true,
        "description": "Customer name"
      },
      "remark": {
        "type": "TEXT",
        "description": "Additional notes about the customer name"
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP",
        "description": "Creation timestamp"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "description": "Last update timestamp"
      }
    },
    "constraints": {
      "unique_customer_name_type": {
        "type": "UNIQUE",
        "fields": [
          "customer_id",
          "name_type_id"
        ]
      }
    }
  },
  "CUSTOMER_TYPES": {
    "name": "customer_types",
    "table_type": "customers-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true,
        "description": "Auto-incremented primary key"
      },
      "customer_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "customers",
          "field": "id",
          "onDelete": "CASCADE"
        },
        "description": "Reference to customers.id"
      },
      "customer_type_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "master_customer_types",
          "field": "id",
          "onDelete": "RESTRICT"
        },
        "description": "Reference to master_customer_types.id"
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP",
        "description": "Creation timestamp"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "description": "Last update timestamp"
      }
    },
    "constraints": {
      "unique_customer_type": {
        "type": "UNIQUE",
        "fields": [
          "customer_id",
          "customer_type_id"
        ]
      }
    }
  },
  "CUSTOMER_ADDRESSES": {
    "name": "customer_addresses",
    "table_type": "customers-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true,
        "description": "Auto-incremented primary key"
      },
      "customer_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "customers",
          "field": "id",
          "onDelete": "CASCADE"
        },
        "description": "Reference to customers.id"
      },
      "address_type_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "master_address_types",
          "field": "id",
          "onDelete": "RESTRICT"
        },
        "description": "Reference to master_address_types.id"
      },
      "address_line1": {
        "type": "VARCHAR(255)",
        "notNull": true,
        "description": "First line of the address"
      },
      "address_line2": {
        "type": "VARCHAR(255)",
        "description": "Second line of the address"
      },
      "address_line3": {
        "type": "VARCHAR(255)",
        "description": "Third line of the address"
      },
      "city": {
        "type": "VARCHAR(100)",
        "description": "City of the address"
      },
      "state": {
        "type": "VARCHAR(100)",
        "description": "State of the address"
      },
      "zip_code": {
        "type": "VARCHAR(20)",
        "description": "Zip code of the address"
      },
      "country": {
        "type": "VARCHAR(100)",
        "description": "Country of the address"
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP",
        "description": "Creation timestamp"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "description": "Last update timestamp"
      }
    }
  },
  "CUSTOMER_CONTACTS": {
    "name": "customer_contacts",
    "table_type": "customers-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true,
        "description": "Auto-incremented primary key"
      },
      "customer_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "customers",
          "field": "id",
          "onDelete": "CASCADE"
        },
        "description": "Reference to customers.id"
      },
      "contact_type_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "master_contact_types",
          "field": "id",
          "onDelete": "RESTRICT"
        },
        "description": "Reference to master_contact_types.id"
      },
      "contact_name": {
        "type": "VARCHAR(100)",
        "notNull": true,
        "description": "Name of the contact"
      },
      "contact_number": {
        "type": "VARCHAR(50)",
        "description": "Contact number (e.g., phone, fax)"
      },
      "contact_email": {
        "type": "VARCHAR(255)",
        "description": "Contact email address"
      },
      "remark": {
        "type": "TEXT",
        "description": "Additional notes about the contact"
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP",
        "description": "Creation timestamp"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "description": "Last update timestamp"
      }
    },
    "constraints": {
      "unique_customer_contact": {
        "type": "UNIQUE",
        "fields": [
          "customer_id",
          "contact_type_id"
        ]
      }
    }
  },
  "CUSTOMER_IMAGES": {
    "name": "customer_images",
    "table_type": "customers-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true,
        "description": "Auto-incremented primary key"
      },
      "customer_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "customers",
          "field": "id",
          "onDelete": "CASCADE"
        },
        "description": "Reference to customers.id"
      },
      "image_type_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "master_customer_image_types",
          "field": "id",
          "onDelete": "RESTRICT"
        },
        "description": "Reference to master_customer_image_types.id"
      },
      "image_name": {
        "type": "VARCHAR(255)",
        "notNull": true,
        "description": "Image name"
      },
      "image_url": {
        "type": "TEXT",
        "notNull": true,
        "description": "URL to customer image"
      },
      "display_order": {
        "type": "INT",
        "default": 0,
        "description": "Order for display purposes"
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP",
        "description": "Creation timestamp"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        "description": "Last update timestamp"
      }
    }
  }
};
