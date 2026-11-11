import * as master_packingTypesModel from '../trade_business/panel/master/master_packingTypesModel.js';
import * as master_packingReliabilityTypesModel from '../trade_business/panel/master/master_packingReliabilityTypesModel.js';
import * as master_productImagesModel from '../trade_business/panel/master/master_productImagesTypeModel.js';
import * as master_productStatusModel from '../trade_business/panel/master/master_productStatusModel.js';
import * as master_productNameTypesModel from '../trade_business/panel/master/master_productNameTypesModel.js';
import * as master_certificateTypesModel from '../trade_business/panel/master/master_certificateTypesModel.js';
import * as master_categoriesModel from '../trade_business/panel/master/master_categoriesModel.js';
import * as master_productKeywordsModel from '../trade_business/panel/master/master_productKeywordsModel.js';
import * as master_supplierTypesModel from '../trade_business/panel/master/master_supplierTypesModel.js';
import * as master_supplierLinkTypesModel from '../trade_business/panel/master/master_supplierLinkTypesModel.js';
import * as master_customerNameTypesModel from '../trade_business/panel/master/master_customerNameTypesModel.js';
import * as master_customerTypesModel from '../trade_business/panel/master/master_customerTypesModel.js';
import * as master_customerImageTypesModel from '../trade_business/panel/master/master_customerImageTypesModel.js';
import * as master_addressTypesModel from '../trade_business/panel/master/master_addressTypesModel.js';
import * as master_contactTypesModel from '../trade_business/panel/master/master_contactTypesModel.js';
import * as master_servicesModel from '../trade_business/panel/master/master_servicesModel.js';
import * as master_serviceImagesModel from '../trade_business/panel/master/master_serviceImagesModel.js';
import * as master_currenciesModel from '../trade_business/panel/master/master_currenciesModel.js';
import * as master_countriesModel from '../trade_business/panel/master/master_countriesModel.js';
import * as master_incotermsModel from '../trade_business/panel/master/master_incotermsModel.js';
import * as master_invoiceTypesModel from '../trade_business/panel/master/master_invoiceTypesModel.js';
import * as master_shippingMethodModel from '../trade_business/panel/master/master_shippingMethodModel.js';
import * as master_exchangeRateHkdModel from '../trade_business/panel/master/master_exchangeRateHkdModel.js';
import * as master_sizeTypesModel from '../trade_business/panel/master/master_sizeTypesModel.js';
import * as master_capacityTypesModel from '../trade_business/panel/master/master_capacityTypesModel.js';
import * as master_colorTypesModel from '../trade_business/panel/master/master_colorTypesModel.js';
import * as master_productAttributesModel from '../trade_business/panel/master/master_product_attributes_model.js';
import * as master_productAttributeDropdownModel from '../trade_business/panel/master/master_product_attribute_dropdown_model.js';
import * as master_productCategoryAttributeAssignModel from '../trade_business/panel/master/master_product_category_attribute_assign_model.js';
import * as master_sellingUnitTypesModel from '../trade_business/panel/master/master_sellingUnitTypesModel.js';
import * as master_productLogisticsAttributesModel from '../trade_business/panel/master/master_productLogisticsAttributesModel.js';
import * as master_productCustomizationOptionsModel from '../trade_business/panel/master/master_productCustomizationOptionsModel.js';
import * as master_membershipTiersModel from '../trade_business/panel/master/master_membershipTiersModel.js';
import * as master_doctypeModel from '../trade_business/panel/master/master_doctypeModel.js';
import * as master_doctypeBaseRelationshipModel from '../trade_business/panel/master/master_doctypeBaseRelationshipModel.js';

import { getProductsSeedData } from '../../../utils/productsSource.js';
import { productModel } from '../trade_business/panel/products/data_products.js';
import { supplierModel } from '../trade_business/panel/suppliers/data_suppliers.js';
import { customerModel } from '../trade_business/panel/customers/data_customers.js';
import { salesQuotationModel } from '../trade_business/panel/sales/data_sales_quotations.js';
import { purchaseRequestModel } from '../trade_business/panel/purchase/data_purchase_requests.js';
import { catalogModel } from '../trade_business/panel/catalogs/data_catalogs.js';

// This file defines the default data mappings for both master and transactional data in the trade business domain. It provides functions to retrieve these mappings, which can be used for seeding the database with initial data or resetting to default values.
export const getMasterDefaultMappings = () => {
  return {
    master_product_status: {
      model: master_productStatusModel.productStatusModel,
      data: [],
    },
    master_product_image_types: {
      model: master_productImagesModel.productImagesTypeModel,
      data: [],
    },
    master_product_name_types: {
      model: master_productNameTypesModel.productNameTypeModel,
      data: [],
    },
    master_categories: {
      model: master_categoriesModel.categoryMasterModel,
      data: [],
    },
    master_packing_types: {
      model: master_packingTypesModel.packingTypeModel,
      data: [],
    },
    master_packing_reliability_types: {
      model: master_packingReliabilityTypesModel.packingReliabilityTypeModel,
      data: [],
    },
    master_certificate_types: {
      model: master_certificateTypesModel.certificateTypeModel,
      data: [],
    },
    master_keywords: {
      model: master_productKeywordsModel.masterKeywordModel,
      data: [],
    },
    master_supplier_types: {
      model: master_supplierTypesModel.supplierTypeModel,
      data: [],
    },
    master_supplier_link_types: {
      model: master_supplierLinkTypesModel.supplierLinkTypeModel,
      data: [],
    },
    master_customer_name_types: {
      model: master_customerNameTypesModel.customerNameTypeModel,
      data: [],
    },
    master_customer_types: {
      model: master_customerTypesModel.customerTypeMasterModel,
      data: [],
    },
    master_customer_image_types: {
      model: master_customerImageTypesModel.customerImageTypeModel,
      data: [],
    },
    master_address_types: {
      model: master_addressTypesModel.addressTypeModel,
      data: [],
    },
    master_contact_types: {
      model: master_contactTypesModel.contactTypeModel,
      data: [],
    },
    master_services: {
      model: master_servicesModel.masterServiceModel,
      data: [],
    },
    master_service_images: {
      model: master_serviceImagesModel.masterServiceImageModel,
      data: [],
    },
    master_currencies: {
      model: master_currenciesModel.currencyModel,
      data: [],
    },
    master_countries: {
      model: master_countriesModel.countryModel,
      data: [],
    },
    master_incoterms: {
      model: master_incotermsModel.incotermModel,
      data: [],
    },
    master_invoice_types: {
      model: master_invoiceTypesModel.invoiceTypeModel,
      data: [],
    },
    master_shipping_method: {
      model: master_shippingMethodModel.shippingMethodModel,
      data: [],
    },
    master_exchange_rate_hkd: {
      model: master_exchangeRateHkdModel.exchangeRateHkdModel,
      data: [],
    },
    master_size_types: {
      model: master_sizeTypesModel.sizeTypeModel,
      data: [],
    },
    master_capacity_types: {
      model: master_capacityTypesModel.capacityTypeModel,
      data: [],
    },
    master_color_types: {
      model: master_colorTypesModel.colorTypeModel,
      data: [],
    },
    master_product_attributes: {
      model: master_productAttributesModel.masterProductAttributesModel,
      data: [],
    },
    master_product_attribute_dropdown: {
      model:
        master_productAttributeDropdownModel.masterProductAttributeDropdownModel,
      data: [],
    },
    master_product_category_attribute_assign: {
      model:
        master_productCategoryAttributeAssignModel.masterProductCategoryAttributeAssignModel,
      data: [],
    },
    master_selling_unit_types: {
      model: master_sellingUnitTypesModel.masterSellingUnitTypesModel,
      data: [],
    },
    master_product_logistics_attributes: {
      model:
        master_productLogisticsAttributesModel.masterProductLogisticsAttributesModel,
      data: [],
    },
    master_product_customization_options: {
      model:
        master_productCustomizationOptionsModel.masterProductCustomizationOptionsModel,
      data: [],
    },
    master_membership_tiers: {
      model: master_membershipTiersModel.membershipTierModel,
      data: [],
    },
    master_doctype: {
      model: master_doctypeModel.doctypeModel,
      data: [],
    },
    master_doctype_base_relationship: {
      model: master_doctypeBaseRelationshipModel.doctypeBaseRelationshipModel,
      data: [],
    },
  };
};

// Function to get default data mappings for transactional data
export const getDataDefaultMappings = () => {
  return [
    {
      name: 'suppliers',
      model: supplierModel,
      data: [],
    },
    {
      name: 'products',
      model: productModel,
      data: getProductsSeedData(),
    },
    {
      name: 'customers',
      model: customerModel,
      data: [],
    },
    {
      name: 'sales',
      model: salesQuotationModel,
      data: [],
    },
    {
      name: 'purchase',
      model: purchaseRequestModel,
      data: [],
    },
    {
      name: 'catalogs',
      model: catalogModel,
      data: { catalogs: [] },
    },
  ];
};
