import { default_master_data } from '../../datas/master.js';
import * as master_packingTypesModel from '../trade_business/master/master_packingTypesModel.js';
import * as master_packingReliabilityTypesModel from '../trade_business/master/master_packingReliabilityTypesModel.js';
import * as master_productImagesModel from '../trade_business/master/master_productImagesTypeModel.js';
import * as master_productStatusModel from '../trade_business/master/master_productStatusModel.js';
import * as master_productNameTypesModel from '../trade_business/master/master_productNameTypesModel.js';
import * as master_certificateTypesModel from '../trade_business/master/master_certificateTypesModel.js';
import * as master_categoriesModel from '../trade_business/master/master_categoriesModel.js';
import * as master_productKeywordsModel from '../trade_business/master/master_productKeywordsModel.js';
import * as master_supplierTypesModel from '../trade_business/master/master_supplierTypesModel.js';
import * as master_supplierLinkTypesModel from '../trade_business/master/master_supplierLinkTypesModel.js';
import * as master_customerNameTypesModel from '../trade_business/master/master_customerNameTypesModel.js';
import * as master_customerTypesModel from '../trade_business/master/master_customerTypesModel.js';
import * as master_customerImageTypesModel from '../trade_business/master/master_customerImageTypesModel.js';
import * as master_addressTypesModel from '../trade_business/master/master_addressTypesModel.js';
import * as master_contactTypesModel from '../trade_business/master/master_contactTypesModel.js';
import * as master_servicesModel from '../trade_business/master/master_servicesModel.js';
import * as master_serviceImagesModel from '../trade_business/master/master_serviceImagesModel.js';
import * as master_currenciesModel from '../trade_business/master/master_currenciesModel.js';
import * as master_sizeTypesModel from '../trade_business/master/master_sizeTypesModel.js';
import * as master_capacityTypesModel from '../trade_business/master/master_capacityTypesModel.js';
import * as master_colorTypesModel from '../trade_business/master/master_colorTypesModel.js';

import { getProductsSeedData } from '../../utils/productsSource.js';
import { defaultSuppliers } from '../../datas/suppliers.js';
import { defaultCustomers } from '../../datas/customers.js';
import { defaultSalesQuotations } from '../../datas/sales.js';
import { defaultPurchaseRequests } from '../../datas/purchase.js';
import { defaultArInvoices } from '../../datas/ar.js';
import { defaultApInvoices } from '../../datas/ap.js';
import { productModel } from '../trade_business/products/data_products.js';
import { supplierModel } from '../trade_business/suppliers/data_suppliers.js';
import { customerModel } from '../trade_business/customers/data_customers.js';
import { salesQuotationModel } from '../trade_business/sales/data_sales_quotations.js';
import { purchaseRequestModel } from '../trade_business/purchase/data_purchase_requests.js';
import { arInvoiceModel } from '../trade_business/ar/data_ar_invoices.js';
import { apInvoiceModel } from '../trade_business/ap/data_ap_invoices.js';

// This file defines the default data mappings for both master and transactional data in the trade business domain. It provides functions to retrieve these mappings, which can be used for seeding the database with initial data or resetting to default values.
export const getMasterDefaultMappings = () => {
  return {
    master_product_status: {
      model: master_productStatusModel.productStatusModel,
      data: default_master_data.master_product_status || [],
    },
    master_product_image_types: {
      model: master_productImagesModel.productImagesTypeModel,
      data: default_master_data.master_product_image_types,
    },
    master_product_name_types: {
      model: master_productNameTypesModel.productNameTypeModel,
      data: default_master_data.master_product_name_types,
    },
    master_categories: {
      model: master_categoriesModel.categoryMasterModel,
      data: default_master_data.master_categories,
    },
    master_packing_types: {
      model: master_packingTypesModel.packingTypeModel,
      data: default_master_data.master_packing_types,
    },
    master_packing_reliability_types: {
      model: master_packingReliabilityTypesModel.packingReliabilityTypeModel,
      data: default_master_data.master_packing_reliability_types,
    },
    master_certificate_types: {
      model: master_certificateTypesModel.certificateTypeModel,
      data: default_master_data.master_certificate_types,
    },
    master_keywords: {
      model: master_productKeywordsModel.masterKeywordModel,
      data: default_master_data.master_keywords,
    },
    master_supplier_types: {
      model: master_supplierTypesModel.supplierTypeModel,
      data: default_master_data.master_supplier_types,
    },
    master_supplier_link_types: {
      model: master_supplierLinkTypesModel.supplierLinkTypeModel,
      data: default_master_data.master_supplier_link_types,
    },
    master_customer_name_types: {
      model: master_customerNameTypesModel.customerNameTypeModel,
      data: default_master_data.master_customer_name_types,
    },
    master_customer_types: {
      model: master_customerTypesModel.customerTypeMasterModel,
      data: default_master_data.master_customer_types,
    },
    master_customer_image_types: {
      model: master_customerImageTypesModel.customerImageTypeModel,
      data: default_master_data.master_customer_image_types,
    },
    master_address_types: {
      model: master_addressTypesModel.addressTypeModel,
      data: default_master_data.master_address_types,
    },
    master_contact_types: {
      model: master_contactTypesModel.contactTypeModel,
      data: default_master_data.master_contact_types,
    },
    master_services: {
      model: master_servicesModel.masterServiceModel,
      data: default_master_data.master_services,
    },
    master_service_images: {
      model: master_serviceImagesModel.masterServiceImageModel,
      data: default_master_data.master_service_images,
    },
    master_currencies: {
      model: master_currenciesModel.currencyModel,
      data: default_master_data.master_currencies,
    },
    master_size_types: {
      model: master_sizeTypesModel.sizeTypeModel,
      data: default_master_data.master_size_types,
    },
    master_capacity_types: {
      model: master_capacityTypesModel.capacityTypeModel,
      data: default_master_data.master_capacity_types,
    },
    master_color_types: {
      model: master_colorTypesModel.colorTypeModel,
      data: default_master_data.master_color_types,
    },
  };
};

// Function to get default data mappings for transactional data
export const getDataDefaultMappings = () => {
  return [
    {
      name: 'suppliers',
      model: supplierModel,
      data: defaultSuppliers,
    },
    {
      name: 'products',
      model: productModel,
      data: getProductsSeedData(),
    },
    {
      name: 'customers',
      model: customerModel,
      data: defaultCustomers,
    },
    {
      name: 'sales',
      model: salesQuotationModel,
      data: defaultSalesQuotations,
    },
    {
      name: 'purchase',
      model: purchaseRequestModel,
      data: defaultPurchaseRequests,
    },
    {
      name: 'ar',
      model: arInvoiceModel,
      data: defaultArInvoices,
    },
    {
      name: 'ap',
      model: apInvoiceModel,
      data: defaultApInvoices,
    },
  ];
};
