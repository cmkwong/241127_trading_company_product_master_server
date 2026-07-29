// Auto-generated from models/tables.js.
export const AP_INVOICES_TABLE_DEFINITIONS = {
  "AP_INVOICES": {
    "name": "ap_invoices",
    "table_type": "ap-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true
      },
      "remark": {
        "type": "TEXT"
      },
      "supplier_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "suppliers",
          "field": "id",
          "onDelete": "RESTRICT"
        }
      },
      "purchase_request_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "purchase_requests",
          "field": "id",
          "onDelete": "RESTRICT"
        }
      },
      "supplier_address_id": {
        "type": "VARCHAR(36)",
        "references": {
          "table": "supplier_addresses",
          "field": "id",
          "onDelete": "SET NULL"
        }
      },
      "invoice_ref": {
        "type": "VARCHAR(120)",
        "description": "Supplier invoice reference number"
      },
      "invoice_date": {
        "type": "DATE",
        "description": "Supplier invoice date"
      },
      "due_date": {
        "type": "DATE",
        "description": "Supplier invoice due date"
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      }
    }
  },
  "AP_INVOICE_ROW_DETAILS": {
    "name": "ap_invoice_row_details",
    "table_type": "ap-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true
      },
      "ap_invoice_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "ap_invoices",
          "field": "id",
          "onDelete": "CASCADE"
        }
      },
      "ap_invoice_type": {
        "type": "VARCHAR(50)",
        "description": "Type of the invoice row, e.g., 'product', 'service', 'shipping', etc.",
        "references": {
          "table": "master_invoice_types",
          "field": "code",
          "onDelete": "RESTRICT"
        }
      },
      "description": {
        "type": "TEXT"
      },
      "amount": {
        "type": "DECIMAL(12,2)"
      },
      "currency_id": {
        "type": "VARCHAR(36)",
        "references": {
          "table": "master_currencies",
          "field": "id",
          "onDelete": "RESTRICT"
        }
      },
      "details": {
        "type": "TEXT"
      },
      "remark": {
        "type": "TEXT",
        "description": "Internal AP remark"
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      }
    }
  },
  "AP_INVOICE_ROW_DETAIL_IMAGES": {
    "name": "ap_invoice_row_detail_images",
    "table_type": "ap-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true
      },
      "ap_invoice_row_detail_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "ap_invoice_row_details",
          "field": "id",
          "onDelete": "CASCADE"
        }
      },
      "image_name": {
        "type": "VARCHAR(255)",
        "notNull": true
      },
      "image_url": {
        "type": "TEXT",
        "notNull": true
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      }
    }
  },
  "AP_INVOICE_ROW_DETAIL_FILES": {
    "name": "ap_invoice_row_detail_files",
    "table_type": "ap-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true
      },
      "ap_invoice_row_detail_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "ap_invoice_row_details",
          "field": "id",
          "onDelete": "CASCADE"
        }
      },
      "file_name": {
        "type": "VARCHAR(255)",
        "notNull": true
      },
      "file_url": {
        "type": "TEXT",
        "notNull": true
      },
      "display_order": {
        "type": "INT",
        "default": 0
      },
      "file_type": {
        "type": "VARCHAR(100)"
      },
      "description": {
        "type": "TEXT"
      },
      "created_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP"
      },
      "updated_at": {
        "type": "TIMESTAMP",
        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      }
    }
  }
};
