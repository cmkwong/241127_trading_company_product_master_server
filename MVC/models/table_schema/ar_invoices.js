// Auto-generated from models/tables.js.
export const AR_INVOICES_TABLE_DEFINITIONS = {
  "AR_INVOICES": {
    "name": "ar_invoices",
    "table_type": "ar-data",
    "fields": {
      "id": {
        "type": "VARCHAR(36)",
        "primaryKey": true
      },
      "remark": {
        "type": "TEXT"
      },
      "customer_id": {
        "type": "VARCHAR(36)",
        "notNull": true,
        "references": {
          "table": "customers",
          "field": "id",
          "onDelete": "RESTRICT"
        }
      },
      "customer_address_id": {
        "type": "VARCHAR(36)",
        "references": {
          "table": "customer_addresses",
          "field": "id",
          "onDelete": "SET NULL"
        }
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
