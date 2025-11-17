import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../../models/dbModel.js';
import AppError from '../../../utils/appError.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new product
 * @param {Object} productData - The product data to create
 * @returns {Promise<Object>} Promise that resolves with the created product
 */
export const createProduct = async (productData) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!productData.productId) {
      throw new AppError('Product ID is required', 400);
    }

    // Generate UUID if not provided
    const productId = productData.id || uuidv4();

    // Start a transaction
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      // 1. Insert the main product
      const insertProductSQL = `
        INSERT INTO products (id, product_id, icon_url, remark)
        VALUES (?, ?, ?, ?)
      `;

      await dbModel.executeQuery(pool, insertProductSQL, [
        productId,
        productData.productId,
        productData.iconUrl || null,
        productData.remark || null,
      ]);

      // 2. Insert product names if provided
      if (productData.productNames && productData.productNames.length > 0) {
        for (const name of productData.productNames) {
          const insertNameSQL = `
            INSERT INTO product_names (product_id, name, name_type_id)
            VALUES (?, ?, ?)
          `;

          await dbModel.executeQuery(pool, insertNameSQL, [
            productId,
            name.name,
            name.type,
          ]);
        }
      }

      // 3. Insert product categories if provided
      if (productData.category && productData.category.length > 0) {
        for (const categoryId of productData.category) {
          const insertCategorySQL = `
            INSERT INTO product_categories (product_id, category_id)
            VALUES (?, ?)
          `;

          await dbModel.executeQuery(pool, insertCategorySQL, [
            productId,
            categoryId,
          ]);
        }
      }

      // 4. Insert customizations if provided
      if (productData.customizations && productData.customizations.length > 0) {
        for (const customization of productData.customizations) {
          // Generate UUID for customization if not provided
          const customizationId = customization.id || uuidv4();

          const insertCustomizationSQL = `
            INSERT INTO customizations (id, product_id, name, code, remark)
            VALUES (?, ?, ?, ?, ?)
          `;

          await dbModel.executeQuery(pool, insertCustomizationSQL, [
            customizationId,
            productId,
            customization.name,
            customization.code || null,
            customization.remark || null,
          ]);

          // Insert customization images if provided
          if (customization.images && customization.images.length > 0) {
            for (let i = 0; i < customization.images.length; i++) {
              const insertImageSQL = `
                INSERT INTO customization_images (customization_id, image_url, display_order)
                VALUES (?, ?, ?)
              `;

              await dbModel.executeQuery(pool, insertImageSQL, [
                customizationId,
                customization.images[i],
                i,
              ]);
            }
          }
        }
      }

      // 5. Insert product links if provided
      if (productData.productLinks && productData.productLinks.length > 0) {
        for (const link of productData.productLinks) {
          // Generate UUID for link if not provided
          const linkId = link.id || uuidv4();

          const insertLinkSQL = `
            INSERT INTO product_links (id, product_id, link, remark, link_date)
            VALUES (?, ?, ?, ?, ?)
          `;

          await dbModel.executeQuery(pool, insertLinkSQL, [
            linkId,
            productId,
            link.link,
            link.remark || null,
            link.date || new Date(),
          ]);

          // Insert link images if provided
          if (link.images && link.images.length > 0) {
            for (let i = 0; i < link.images.length; i++) {
              const insertImageSQL = `
                INSERT INTO product_link_images (product_link_id, image_url, display_order)
                VALUES (?, ?, ?)
              `;

              await dbModel.executeQuery(pool, insertImageSQL, [
                linkId,
                link.images[i],
                i,
              ]);
            }
          }
        }
      }

      // 6. Insert Alibaba IDs if provided
      if (productData.alibabaIds && productData.alibabaIds.length > 0) {
        for (const alibaba of productData.alibabaIds) {
          // Generate UUID for alibaba ID if not provided
          const alibabaId = alibaba.id || uuidv4();

          const insertAlibabaSQL = `
            INSERT INTO alibaba_ids (id, product_id, value, link)
            VALUES (?, ?, ?, ?)
          `;

          await dbModel.executeQuery(pool, insertAlibabaSQL, [
            alibabaId,
            productId,
            alibaba.value,
            alibaba.link || null,
          ]);
        }
      }

      // 7. Insert product packings if provided
      if (productData.packings && productData.packings.length > 0) {
        for (const packing of productData.packings) {
          // Generate UUID for packing if not provided
          const packingId = packing.id || uuidv4();

          const insertPackingSQL = `
            INSERT INTO product_packings (id, product_id, packing_type_id, length, width, height, quantity, weight)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          await dbModel.executeQuery(pool, insertPackingSQL, [
            packingId,
            productId,
            packing.type,
            packing.L || null,
            packing.W || null,
            packing.H || null,
            packing.qty || null,
            packing.kg || null,
          ]);
        }
      }

      // 8. Insert certificates if provided
      if (productData.certificates && productData.certificates.length > 0) {
        for (const certificate of productData.certificates) {
          // Generate UUID for certificate if not provided
          const certificateId = certificate.id || uuidv4();

          const insertCertificateSQL = `
            INSERT INTO certificates (id, product_id, certificate_type_id, remark)
            VALUES (?, ?, ?, ?)
          `;

          await dbModel.executeQuery(pool, insertCertificateSQL, [
            certificateId,
            productId,
            certificate.type,
            certificate.remark || null,
          ]);

          // Insert certificate files if provided
          if (certificate.files && certificate.files.length > 0) {
            for (const file of certificate.files) {
              const insertFileSQL = `
                INSERT INTO certificate_files (certificate_id, file_url)
                VALUES (?, ?)
              `;

              await dbModel.executeQuery(pool, insertFileSQL, [
                certificateId,
                file,
              ]);
            }
          }
        }
      }

      // Commit the transaction
      await dbModel.executeQuery(pool, 'COMMIT');

      // Get the created product
      const createdProduct = await getProductById(productId);

      return {
        message: 'Product created successfully',
        product: createdProduct,
      };
    } catch (error) {
      // Rollback the transaction on error
      await dbModel.executeQuery(pool, 'ROLLBACK');
      throw error;
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('A product with this ID already exists', 409);
    }
    throw new AppError(
      `Failed to create product: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets a product by ID with all related data
 * @param {string} id - The ID of the product to retrieve
 * @returns {Promise<Object>} Promise that resolves with the product data
 */
export const getProductById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // 1. Get the main product data
    const productSQL = `
      SELECT id, product_id, icon_url, remark
      FROM products
      WHERE id = ?
    `;

    const productResult = await dbModel.executeQuery(pool, productSQL, [id]);

    if (productResult.length === 0) {
      throw new AppError('Product not found', 404);
    }

    const product = productResult[0];

    // 2. Get product names
    const namesSQL = `
      SELECT name, name_type_id as type
      FROM product_names
      WHERE product_id = ?
      ORDER BY name_type_id
    `;

    const productNames = await dbModel.executeQuery(pool, namesSQL, [id]);
    product.productNames = productNames;

    // 3. Get product categories
    const categoriesSQL = `
      SELECT c.id, c.name, c.description
      FROM categories c
      JOIN product_categories pc ON c.id = pc.category_id
      WHERE pc.product_id = ?
    `;

    const categories = await dbModel.executeQuery(pool, categoriesSQL, [id]);
    product.categories = categories;
    product.category = categories.map((cat) => cat.id);

    // 4. Get customizations and their images
    const customizationsSQL = `
      SELECT id, name, code, remark
      FROM customizations
      WHERE product_id = ?
    `;

    const customizations = await dbModel.executeQuery(pool, customizationsSQL, [
      id,
    ]);

    for (const customization of customizations) {
      const imagesSQL = `
        SELECT image_url
        FROM customization_images
        WHERE customization_id = ?
        ORDER BY display_order
      `;

      const imagesResult = await dbModel.executeQuery(pool, imagesSQL, [
        customization.id,
      ]);
      customization.images = imagesResult.map((img) => img.image_url);
    }

    product.customizations = customizations;

    // 5. Get product links and their images
    const linksSQL = `
      SELECT id, link, remark, link_date as date
      FROM product_links
      WHERE product_id = ?
    `;

    const links = await dbModel.executeQuery(pool, linksSQL, [id]);

    for (const link of links) {
      const imagesSQL = `
        SELECT image_url
        FROM product_link_images
        WHERE product_link_id = ?
        ORDER BY display_order
      `;

      const imagesResult = await dbModel.executeQuery(pool, imagesSQL, [
        link.id,
      ]);
      link.images = imagesResult.map((img) => img.image_url);
    }

    product.productLinks = links;

    // 6. Get Alibaba IDs
    const alibabaSQL = `
      SELECT id, value, link
      FROM alibaba_ids
      WHERE product_id = ?
    `;

    const alibabaIds = await dbModel.executeQuery(pool, alibabaSQL, [id]);
    product.alibabaIds = alibabaIds;

    // 7. Get product packings
    const packingsSQL = `
      SELECT pp.id, pp.packing_type_id as type, pt.name as type_name,
             pp.length as L, pp.width as W, pp.height as H, 
             pp.quantity as qty, pp.weight as kg
      FROM product_packings pp
      LEFT JOIN packing_types pt ON pp.packing_type_id = pt.id
      WHERE pp.product_id = ?
    `;

    const packings = await dbModel.executeQuery(pool, packingsSQL, [id]);
    product.packings = packings;

    // 8. Get certificates and their files
    const certificatesSQL = `
      SELECT c.id, c.certificate_type_id as type, ct.name as type_name, c.remark
      FROM certificates c
      LEFT JOIN certificate_types ct ON c.certificate_type_id = ct.id
      WHERE c.product_id = ?
    `;

    const certificates = await dbModel.executeQuery(pool, certificatesSQL, [
      id,
    ]);

    for (const certificate of certificates) {
      const filesSQL = `
        SELECT file_url
        FROM certificate_files
        WHERE certificate_id = ?
      `;

      const filesResult = await dbModel.executeQuery(pool, filesSQL, [
        certificate.id,
      ]);
      certificate.files = filesResult.map((file) => file.file_url);
    }

    product.certificates = certificates;

    return product;
  } catch (error) {
    throw new AppError(
      `Failed to get product: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Gets all products with optional filtering and pagination
 * @param {Object} [options] - Query options
 * @param {string} [options.search] - Search term for product ID or name
 * @param {string} [options.category] - Category ID to filter by
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Number of results per page
 * @returns {Promise<Object>} Promise that resolves with products and pagination info
 */
export const getAllProducts = async (options = {}) => {
  try {
    const pool = dbConn.tb_pool;
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Build the WHERE clause based on filters
    let whereClause = '1=1';
    const params = [];

    if (options.search) {
      whereClause += ` AND (p.product_id LIKE ? OR EXISTS (
        SELECT 1 FROM product_names pn 
        WHERE pn.product_id = p.id AND pn.name LIKE ?
      ))`;
      params.push(`%${options.search}%`, `%${options.search}%`);
    }

    if (options.category) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM product_categories pc 
        WHERE pc.product_id = p.id AND pc.category_id = ?
      )`;
      params.push(options.category);
    }

    // Get total count for pagination
    const countSQL = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      WHERE ${whereClause}
    `;

    const countResult = await dbModel.executeQuery(pool, countSQL, params);
    const total = countResult[0].total;

    // Get products with pagination
    const selectSQL = `
      SELECT p.id, p.product_id, p.icon_url, p.remark
      FROM products p
      WHERE ${whereClause}
      ORDER BY p.product_id ASC
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const queryParams = [...params, limit, offset];
    const productsResult = await dbModel.executeQuery(
      pool,
      selectSQL,
      queryParams
    );

    // Get additional data for each product
    const products = [];

    for (const product of productsResult) {
      // Get product names
      const namesSQL = `
        SELECT name, name_type_id as type
        FROM product_names
        WHERE product_id = ?
        ORDER BY name_type_id
      `;

      const productNames = await dbModel.executeQuery(pool, namesSQL, [
        product.id,
      ]);
      product.productNames = productNames;

      // Get product categories (just IDs and names)
      const categoriesSQL = `
        SELECT c.id, c.name
        FROM categories c
        JOIN product_categories pc ON c.id = pc.category_id
        WHERE pc.product_id = ?
      `;

      const categories = await dbModel.executeQuery(pool, categoriesSQL, [
        product.id,
      ]);
      product.categories = categories;

      // Get customization count
      const customizationCountSQL = `
        SELECT COUNT(*) as count
        FROM customizations
        WHERE product_id = ?
      `;

      const customizationCount = await dbModel.executeQuery(
        pool,
        customizationCountSQL,
        [product.id]
      );
      product.customizationCount = customizationCount[0].count;

      // Get packing count
      const packingCountSQL = `
        SELECT COUNT(*) as count
        FROM product_packings
        WHERE product_id = ?
      `;

      const packingCount = await dbModel.executeQuery(pool, packingCountSQL, [
        product.id,
      ]);
      product.packingCount = packingCount[0].count;

      products.push(product);
    }

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(`Failed to get products: ${error.message}`, 500);
  }
};

/**
 * Updates a product
 * @param {string} id - The ID of the product to update
 * @param {Object} updateData - The product data to update
 * @returns {Promise<Object>} Promise that resolves with the updated product
 */
export const updateProduct = async (id, updateData) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if product exists
    const existingProduct = await getProductById(id);

    // Start a transaction
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      // 1. Update the main product
      if (
        updateData.productId ||
        updateData.iconUrl !== undefined ||
        updateData.remark !== undefined
      ) {
        const updateFields = [];
        const updateValues = [];

        if (updateData.productId) {
          updateFields.push('product_id = ?');
          updateValues.push(updateData.productId);
        }

        if (updateData.iconUrl !== undefined) {
          updateFields.push('icon_url = ?');
          updateValues.push(updateData.iconUrl);
        }

        if (updateData.remark !== undefined) {
          updateFields.push('remark = ?');
          updateValues.push(updateData.remark);
        }

        if (updateFields.length > 0) {
          const updateProductSQL = `
            UPDATE products
            SET ${updateFields.join(', ')}
            WHERE id = ?
          `;

          updateValues.push(id);
          await dbModel.executeQuery(pool, updateProductSQL, updateValues);
        }
      }

      // 2. Update product names if provided
      if (updateData.productNames) {
        // Delete existing names
        await dbModel.executeQuery(
          pool,
          'DELETE FROM product_names WHERE product_id = ?',
          [id]
        );

        // Insert new names
        for (const name of updateData.productNames) {
          const insertNameSQL = `
            INSERT INTO product_names (product_id, name, name_type_id)
            VALUES (?, ?, ?)
          `;

          await dbModel.executeQuery(pool, insertNameSQL, [
            id,
            name.name,
            name.type,
          ]);
        }
      }

      // 3. Update product categories if provided
      if (updateData.category) {
        // Delete existing categories
        await dbModel.executeQuery(
          pool,
          'DELETE FROM product_categories WHERE product_id = ?',
          [id]
        );

        // Insert new categories
        for (const categoryId of updateData.category) {
          const insertCategorySQL = `
            INSERT INTO product_categories (product_id, category_id)
            VALUES (?, ?)
          `;

          await dbModel.executeQuery(pool, insertCategorySQL, [id, categoryId]);
        }
      }

      // 4. Update customizations if provided
      if (updateData.customizations) {
        // Get existing customization IDs
        const existingCustomizationsSQL = `
          SELECT id FROM customizations WHERE product_id = ?
        `;

        const existingCustomizations = await dbModel.executeQuery(
          pool,
          existingCustomizationsSQL,
          [id]
        );
        const existingIds = existingCustomizations.map((c) => c.id);

        // Track IDs to keep
        const idsToKeep = [];

        // Update or insert customizations
        for (const customization of updateData.customizations) {
          if (customization.id && existingIds.includes(customization.id)) {
            // Update existing customization
            const updateCustomizationSQL = `
              UPDATE customizations
              SET name = ?, code = ?, remark = ?
              WHERE id = ?
            `;

            await dbModel.executeQuery(pool, updateCustomizationSQL, [
              customization.name,
              customization.code || null,
              customization.remark || null,
              customization.id,
            ]);

            idsToKeep.push(customization.id);

            // Update images if provided
            if (customization.images) {
              // Delete existing images
              await dbModel.executeQuery(
                pool,
                'DELETE FROM customization_images WHERE customization_id = ?',
                [customization.id]
              );

              // Insert new images
              for (let i = 0; i < customization.images.length; i++) {
                const insertImageSQL = `
                  INSERT INTO customization_images (customization_id, image_url, display_order)
                  VALUES (?, ?, ?)
                `;

                await dbModel.executeQuery(pool, insertImageSQL, [
                  customization.id,
                  customization.images[i],
                  i,
                ]);
              }
            }
          } else {
            // Insert new customization
            const customizationId = customization.id || uuidv4();

            const insertCustomizationSQL = `
              INSERT INTO customizations (id, product_id, name, code, remark)
              VALUES (?, ?, ?, ?, ?)
            `;

            await dbModel.executeQuery(pool, insertCustomizationSQL, [
              customizationId,
              id,
              customization.name,
              customization.code || null,
              customization.remark || null,
            ]);

            idsToKeep.push(customizationId);

            // Insert images if provided
            if (customization.images && customization.images.length > 0) {
              for (let i = 0; i < customization.images.length; i++) {
                const insertImageSQL = `
                  INSERT INTO customization_images (customization_id, image_url, display_order)
                  VALUES (?, ?, ?)
                `;

                await dbModel.executeQuery(pool, insertImageSQL, [
                  customizationId,
                  customization.images[i],
                  i,
                ]);
              }
            }
          }
        }

        // Delete customizations not in the update data
        const idsToDelete = existingIds.filter((id) => !idsToKeep.includes(id));

        if (idsToDelete.length > 0) {
          for (const deleteId of idsToDelete) {
            // Delete images first
            await dbModel.executeQuery(
              pool,
              'DELETE FROM customization_images WHERE customization_id = ?',
              [deleteId]
            );

            // Then delete customization
            await dbModel.executeQuery(
              pool,
              'DELETE FROM customizations WHERE id = ?',
              [deleteId]
            );
          }
        }
      }

      // 5. Update product links if provided
      if (updateData.productLinks) {
        // Similar pattern to customizations
        const existingLinksSQL = `
          SELECT id FROM product_links WHERE product_id = ?
        `;

        const existingLinks = await dbModel.executeQuery(
          pool,
          existingLinksSQL,
          [id]
        );
        const existingIds = existingLinks.map((l) => l.id);

        // Track IDs to keep
        const idsToKeep = [];

        // Update or insert links
        for (const link of updateData.productLinks) {
          if (link.id && existingIds.includes(link.id)) {
            // Update existing link
            const updateLinkSQL = `
              UPDATE product_links
              SET link = ?, remark = ?, link_date = ?
              WHERE id = ?
            `;

            await dbModel.executeQuery(pool, updateLinkSQL, [
              link.link,
              link.remark || null,
              link.date || new Date(),
              link.id,
            ]);

            idsToKeep.push(link.id);

            // Update images if provided
            if (link.images) {
              // Delete existing images
              await dbModel.executeQuery(
                pool,
                'DELETE FROM product_link_images WHERE product_link_id = ?',
                [link.id]
              );

              // Insert new images
              for (let i = 0; i < link.images.length; i++) {
                const insertImageSQL = `
                  INSERT INTO product_link_images (product_link_id, image_url, display_order)
                  VALUES (?, ?, ?)
                `;

                await dbModel.executeQuery(pool, insertImageSQL, [
                  link.id,
                  link.images[i],
                  i,
                ]);
              }
            }
          } else {
            // Insert new link
            const linkId = link.id || uuidv4();

            const insertLinkSQL = `
              INSERT INTO product_links (id, product_id, link, remark, link_date)
              VALUES (?, ?, ?, ?, ?)
            `;

            await dbModel.executeQuery(pool, insertLinkSQL, [
              linkId,
              id,
              link.link,
              link.remark || null,
              link.date || new Date(),
            ]);

            idsToKeep.push(linkId);

            // Insert images if provided
            if (link.images && link.images.length > 0) {
              for (let i = 0; i < link.images.length; i++) {
                const insertImageSQL = `
                  INSERT INTO product_link_images (product_link_id, image_url, display_order)
                  VALUES (?, ?, ?)
                `;

                await dbModel.executeQuery(pool, insertImageSQL, [
                  linkId,
                  link.images[i],
                  i,
                ]);
              }
            }
          }
        }

        // Delete links not in the update data
        const idsToDelete = existingIds.filter((id) => !idsToKeep.includes(id));

        if (idsToDelete.length > 0) {
          for (const deleteId of idsToDelete) {
            // Delete images first
            await dbModel.executeQuery(
              pool,
              'DELETE FROM product_link_images WHERE product_link_id = ?',
              [deleteId]
            );

            // Then delete link
            await dbModel.executeQuery(
              pool,
              'DELETE FROM product_links WHERE id = ?',
              [deleteId]
            );
          }
        }
      }

      // 6. Update Alibaba IDs if provided
      if (updateData.alibabaIds) {
        // Delete existing Alibaba IDs
        await dbModel.executeQuery(
          pool,
          'DELETE FROM alibaba_ids WHERE product_id = ?',
          [id]
        );

        // Insert new Alibaba IDs
        for (const alibaba of updateData.alibabaIds) {
          const alibabaId = alibaba.id || uuidv4();

          const insertAlibabaSQL = `
            INSERT INTO alibaba_ids (id, product_id, value, link)
            VALUES (?, ?, ?, ?)
          `;

          await dbModel.executeQuery(pool, insertAlibabaSQL, [
            alibabaId,
            id,
            alibaba.value,
            alibaba.link || null,
          ]);
        }
      }

      // 7. Update product packings if provided
      if (updateData.packings) {
        // Similar pattern to customizations and links
        const existingPackingsSQL = `
          SELECT id FROM product_packings WHERE product_id = ?
        `;

        const existingPackings = await dbModel.executeQuery(
          pool,
          existingPackingsSQL,
          [id]
        );
        const existingIds = existingPackings.map((p) => p.id);

        // Track IDs to keep
        const idsToKeep = [];

        // Update or insert packings
        for (const packing of updateData.packings) {
          if (packing.id && existingIds.includes(packing.id)) {
            // Update existing packing
            const updatePackingSQL = `
              UPDATE product_packings
              SET packing_type_id = ?, length = ?, width = ?, height = ?, quantity = ?, weight = ?
              WHERE id = ?
            `;

            await dbModel.executeQuery(pool, updatePackingSQL, [
              packing.type,
              packing.L || null,
              packing.W || null,
              packing.H || null,
              packing.qty || null,
              packing.kg || null,
              packing.id,
            ]);

            idsToKeep.push(packing.id);
          } else {
            // Insert new packing
            const packingId = packing.id || uuidv4();

            const insertPackingSQL = `
              INSERT INTO product_packings (id, product_id, packing_type_id, length, width, height, quantity, weight)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await dbModel.executeQuery(pool, insertPackingSQL, [
              packingId,
              id,
              packing.type,
              packing.L || null,
              packing.W || null,
              packing.H || null,
              packing.qty || null,
              packing.kg || null,
            ]);

            idsToKeep.push(packingId);
          }
        }

        // Delete packings not in the update data
        const idsToDelete = existingIds.filter((id) => !idsToKeep.includes(id));

        if (idsToDelete.length > 0) {
          for (const deleteId of idsToDelete) {
            await dbModel.executeQuery(
              pool,
              'DELETE FROM product_packings WHERE id = ?',
              [deleteId]
            );
          }
        }
      }

      // 8. Update certificates if provided
      if (updateData.certificates) {
        // Similar pattern to customizations, links, and packings
        const existingCertificatesSQL = `
          SELECT id FROM certificates WHERE product_id = ?
        `;

        const existingCertificates = await dbModel.executeQuery(
          pool,
          existingCertificatesSQL,
          [id]
        );
        const existingIds = existingCertificates.map((c) => c.id);

        // Track IDs to keep
        const idsToKeep = [];

        // Update or insert certificates
        for (const certificate of updateData.certificates) {
          if (certificate.id && existingIds.includes(certificate.id)) {
            // Update existing certificate
            const updateCertificateSQL = `
              UPDATE certificates
              SET certificate_type_id = ?, remark = ?
              WHERE id = ?
            `;

            await dbModel.executeQuery(pool, updateCertificateSQL, [
              certificate.type,
              certificate.remark || null,
              certificate.id,
            ]);

            idsToKeep.push(certificate.id);

            // Update files if provided
            if (certificate.files) {
              // Delete existing files
              await dbModel.executeQuery(
                pool,
                'DELETE FROM certificate_files WHERE certificate_id = ?',
                [certificate.id]
              );

              // Insert new files
              for (const file of certificate.files) {
                const insertFileSQL = `
                  INSERT INTO certificate_files (certificate_id, file_url)
                  VALUES (?, ?)
                `;

                await dbModel.executeQuery(pool, insertFileSQL, [
                  certificate.id,
                  file,
                ]);
              }
            }
          } else {
            // Insert new certificate
            const certificateId = certificate.id || uuidv4();

            const insertCertificateSQL = `
              INSERT INTO certificates (id, product_id, certificate_type_id, remark)
              VALUES (?, ?, ?, ?)
            `;

            await dbModel.executeQuery(pool, insertCertificateSQL, [
              certificateId,
              id,
              certificate.type,
              certificate.remark || null,
            ]);

            idsToKeep.push(certificateId);

            // Insert files if provided
            if (certificate.files && certificate.files.length > 0) {
              for (const file of certificate.files) {
                const insertFileSQL = `
                  INSERT INTO certificate_files (certificate_id, file_url)
                  VALUES (?, ?)
                `;

                await dbModel.executeQuery(pool, insertFileSQL, [
                  certificateId,
                  file,
                ]);
              }
            }
          }
        }

        // Delete certificates not in the update data
        const idsToDelete = existingIds.filter((id) => !idsToKeep.includes(id));

        if (idsToDelete.length > 0) {
          for (const deleteId of idsToDelete) {
            // Delete files first
            await dbModel.executeQuery(
              pool,
              'DELETE FROM certificate_files WHERE certificate_id = ?',
              [deleteId]
            );

            // Then delete certificate
            await dbModel.executeQuery(
              pool,
              'DELETE FROM certificates WHERE id = ?',
              [deleteId]
            );
          }
        }
      }

      // Commit the transaction
      await dbModel.executeQuery(pool, 'COMMIT');

      // Get the updated product
      const updatedProduct = await getProductById(id);

      return {
        message: 'Product updated successfully',
        product: updatedProduct,
      };
    } catch (error) {
      // Rollback the transaction on error
      await dbModel.executeQuery(pool, 'ROLLBACK');
      throw error;
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('A product with this ID already exists', 409);
    }
    throw new AppError(
      `Failed to update product: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Deletes a product and all related data
 * @param {string} id - The ID of the product to delete
 * @returns {Promise<Object>} Promise that resolves with deletion result
 */
export const deleteProduct = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Check if product exists
    await getProductById(id);

    // Start a transaction
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      // Delete in reverse order of dependencies

      // 1. Delete certificate files
      await dbModel.executeQuery(
        pool,
        `
        DELETE cf FROM certificate_files cf
        JOIN certificates c ON cf.certificate_id = c.id
        WHERE c.product_id = ?
      `,
        [id]
      );

      // 2. Delete certificates
      await dbModel.executeQuery(
        pool,
        'DELETE FROM certificates WHERE product_id = ?',
        [id]
      );

      // 3. Delete product packings
      await dbModel.executeQuery(
        pool,
        'DELETE FROM product_packings WHERE product_id = ?',
        [id]
      );

      // 4. Delete Alibaba IDs
      await dbModel.executeQuery(
        pool,
        'DELETE FROM alibaba_ids WHERE product_id = ?',
        [id]
      );

      // 5. Delete product link images
      await dbModel.executeQuery(
        pool,
        `
        DELETE pli FROM product_link_images pli
        JOIN product_links pl ON pli.product_link_id = pl.id
        WHERE pl.product_id = ?
      `,
        [id]
      );

      // 6. Delete product links
      await dbModel.executeQuery(
        pool,
        'DELETE FROM product_links WHERE product_id = ?',
        [id]
      );

      // 7. Delete customization images
      await dbModel.executeQuery(
        pool,
        `
        DELETE ci FROM customization_images ci
        JOIN customizations c ON ci.customization_id = c.id
        WHERE c.product_id = ?
      `,
        [id]
      );

      // 8. Delete customizations
      await dbModel.executeQuery(
        pool,
        'DELETE FROM customizations WHERE product_id = ?',
        [id]
      );

      // 9. Delete product categories
      await dbModel.executeQuery(
        pool,
        'DELETE FROM product_categories WHERE product_id = ?',
        [id]
      );

      // 10. Delete product names
      await dbModel.executeQuery(
        pool,
        'DELETE FROM product_names WHERE product_id = ?',
        [id]
      );

      // 11. Finally, delete the product
      await dbModel.executeQuery(pool, 'DELETE FROM products WHERE id = ?', [
        id,
      ]);

      // Commit the transaction
      await dbModel.executeQuery(pool, 'COMMIT');

      return {
        message: 'Product deleted successfully',
        id,
      };
    } catch (error) {
      // Rollback the transaction on error
      await dbModel.executeQuery(pool, 'ROLLBACK');
      throw error;
    }
  } catch (error) {
    throw new AppError(
      `Failed to delete product: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Imports product data into the database
 * @param {Array} products - Array of product objects to import
 * @returns {Promise<Object>} Promise that resolves with import results
 */
export const importProducts = async (products) => {
  try {
    const pool = dbConn.tb_pool;
    const results = {
      total: products.length,
      successful: 0,
      failed: 0,
      details: [],
    };

    // Start a transaction for data integrity
    await dbModel.executeQuery(pool, 'START TRANSACTION');

    try {
      for (const product of products) {
        const productResult = {
          productId: product.productId,
          success: false,
          details: {},
        };

        try {
          // 1. Insert the main product
          const insertProductSQL = `
            INSERT INTO products (id, product_id, icon_url, remark)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            icon_url = VALUES(icon_url),
            remark = VALUES(remark)
          `;

          await dbModel.executeQuery(pool, insertProductSQL, [
            product.id,
            product.productId,
            product.iconUrl,
            product.remark,
          ]);

          productResult.details.product = { success: true };

          // 2. Insert product names
          if (product.productNames && product.productNames.length > 0) {
            const nameResults = [];

            for (const name of product.productNames) {
              try {
                const insertNameSQL = `
                  INSERT INTO product_names (product_id, name, name_type_id)
                  VALUES (?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                  name = VALUES(name)
                `;

                await dbModel.executeQuery(pool, insertNameSQL, [
                  product.id,
                  name.name,
                  name.type,
                ]);

                nameResults.push({
                  type: name.type,
                  success: true,
                });
              } catch (error) {
                nameResults.push({
                  type: name.type,
                  success: false,
                  error: error.message,
                });
              }
            }

            productResult.details.names = nameResults;
          }

          // 3. Insert product categories
          if (product.category && product.category.length > 0) {
            const categoryResults = [];

            // First, delete existing categories for this product
            await dbModel.executeQuery(
              pool,
              'DELETE FROM product_categories WHERE product_id = ?',
              [product.id]
            );

            // Then insert new categories
            for (const categoryId of product.category) {
              try {
                const insertCategorySQL = `
                  INSERT INTO product_categories (product_id, category_id)
                  VALUES (?, ?)
                `;

                await dbModel.executeQuery(pool, insertCategorySQL, [
                  product.id,
                  categoryId,
                ]);

                categoryResults.push({
                  categoryId,
                  success: true,
                });
              } catch (error) {
                categoryResults.push({
                  categoryId,
                  success: false,
                  error: error.message,
                });
              }
            }

            productResult.details.categories = categoryResults;
          }

          // 4. Insert customizations and their images
          if (product.customizations && product.customizations.length > 0) {
            const customizationResults = [];

            for (const customization of product.customizations) {
              try {
                // First insert the customization
                const insertCustomizationSQL = `
                  INSERT INTO customizations (id, product_id, name, code, remark)
                  VALUES (?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                  name = VALUES(name),
                  code = VALUES(code),
                  remark = VALUES(remark)
                `;

                await dbModel.executeQuery(pool, insertCustomizationSQL, [
                  customization.id,
                  product.id,
                  customization.name,
                  customization.code,
                  customization.remark,
                ]);

                // Then insert images for this customization
                if (customization.images && customization.images.length > 0) {
                  // First, delete existing images for this customization
                  await dbModel.executeQuery(
                    pool,
                    'DELETE FROM customization_images WHERE customization_id = ?',
                    [customization.id]
                  );

                  // Then insert new images
                  for (let i = 0; i < customization.images.length; i++) {
                    const insertImageSQL = `
                      INSERT INTO customization_images (customization_id, image_url, display_order)
                      VALUES (?, ?, ?)
                    `;

                    await dbModel.executeQuery(pool, insertImageSQL, [
                      customization.id,
                      customization.images[i],
                      i,
                    ]);
                  }
                }

                customizationResults.push({
                  id: customization.id,
                  success: true,
                });
              } catch (error) {
                customizationResults.push({
                  id: customization.id,
                  success: false,
                  error: error.message,
                });
              }
            }

            productResult.details.customizations = customizationResults;
          }

          // 5. Insert product links and their images
          if (product.productLinks && product.productLinks.length > 0) {
            const linkResults = [];

            for (const link of product.productLinks) {
              try {
                // First insert the link
                const insertLinkSQL = `
                  INSERT INTO product_links (id, product_id, link, remark, link_date)
                  VALUES (?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                  link = VALUES(link),
                  remark = VALUES(remark),
                  link_date = VALUES(link_date)
                `;

                await dbModel.executeQuery(pool, insertLinkSQL, [
                  link.id,
                  product.id,
                  link.link,
                  link.remark,
                  link.date,
                ]);

                // Then insert images for this link
                if (link.images && link.images.length > 0) {
                  // First, delete existing images for this link
                  await dbModel.executeQuery(
                    pool,
                    'DELETE FROM product_link_images WHERE product_link_id = ?',
                    [link.id]
                  );

                  // Then insert new images
                  for (let i = 0; i < link.images.length; i++) {
                    const insertImageSQL = `
                      INSERT INTO product_link_images (product_link_id, image_url, display_order)
                      VALUES (?, ?, ?)
                    `;

                    await dbModel.executeQuery(pool, insertImageSQL, [
                      link.id,
                      link.images[i],
                      i,
                    ]);
                  }
                }

                linkResults.push({
                  id: link.id,
                  success: true,
                });
              } catch (error) {
                linkResults.push({
                  id: link.id,
                  success: false,
                  error: error.message,
                });
              }
            }

            productResult.details.links = linkResults;
          }

          // 6. Insert Alibaba IDs
          if (product.alibabaIds && product.alibabaIds.length > 0) {
            const alibabaResults = [];

            for (const alibaba of product.alibabaIds) {
              try {
                const insertAlibabaSQL = `
                  INSERT INTO alibaba_ids (id, product_id, value, link)
                  VALUES (?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                  value = VALUES(value),
                  link = VALUES(link)
                `;

                await dbModel.executeQuery(pool, insertAlibabaSQL, [
                  alibaba.id,
                  product.id,
                  alibaba.value,
                  alibaba.link,
                ]);

                alibabaResults.push({
                  id: alibaba.id,
                  success: true,
                });
              } catch (error) {
                alibabaResults.push({
                  id: alibaba.id,
                  success: false,
                  error: error.message,
                });
              }
            }

            productResult.details.alibabaIds = alibabaResults;
          }

          // 7. Insert product packings
          if (product.packings && product.packings.length > 0) {
            const packingResults = [];

            for (const packing of product.packings) {
              try {
                const insertPackingSQL = `
                  INSERT INTO product_packings (id, product_id, packing_type_id, length, width, height, quantity, weight)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                  packing_type_id = VALUES(packing_type_id),
                  length = VALUES(length),
                  width = VALUES(width),
                  height = VALUES(height),
                  quantity = VALUES(quantity),
                  weight = VALUES(weight)
                `;

                await dbModel.executeQuery(pool, insertPackingSQL, [
                  packing.id,
                  product.id,
                  packing.type,
                  packing.L,
                  packing.W,
                  packing.H,
                  packing.qty,
                  packing.kg,
                ]);

                packingResults.push({
                  id: packing.id,
                  success: true,
                });
              } catch (error) {
                packingResults.push({
                  id: packing.id,
                  success: false,
                  error: error.message,
                });
              }
            }

            productResult.details.packings = packingResults;
          }

          // 8. Insert certificates and their files
          if (product.certificates && product.certificates.length > 0) {
            const certificateResults = [];

            for (const certificate of product.certificates) {
              try {
                // First insert the certificate
                const insertCertificateSQL = `
                  INSERT INTO certificates (id, product_id, certificate_type_id, remark)
                  VALUES (?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                  certificate_type_id = VALUES(certificate_type_id),
                  remark = VALUES(remark)
                `;

                await dbModel.executeQuery(pool, insertCertificateSQL, [
                  certificate.id,
                  product.id,
                  certificate.type,
                  certificate.remark,
                ]);

                // Then insert files for this certificate
                if (certificate.files && certificate.files.length > 0) {
                  // First, delete existing files for this certificate
                  await dbModel.executeQuery(
                    pool,
                    'DELETE FROM certificate_files WHERE certificate_id = ?',
                    [certificate.id]
                  );

                  // Then insert new files
                  for (const file of certificate.files) {
                    const insertFileSQL = `
                      INSERT INTO certificate_files (certificate_id, file_url)
                      VALUES (?, ?)
                    `;

                    await dbModel.executeQuery(pool, insertFileSQL, [
                      certificate.id,
                      file,
                    ]);
                  }
                }

                certificateResults.push({
                  id: certificate.id,
                  success: true,
                });
              } catch (error) {
                certificateResults.push({
                  id: certificate.id,
                  success: false,
                  error: error.message,
                });
              }
            }

            productResult.details.certificates = certificateResults;
          }

          // If we got here, the product was imported successfully
          productResult.success = true;
          results.successful++;
        } catch (error) {
          productResult.success = false;
          productResult.error = error.message;
          results.failed++;
        }

        results.details.push(productResult);
      }

      // If everything went well, commit the transaction
      await dbModel.executeQuery(pool, 'COMMIT');
    } catch (error) {
      // If there was an error, roll back the transaction
      await dbModel.executeQuery(pool, 'ROLLBACK');
      throw error;
    }

    return results;
  } catch (error) {
    throw new AppError(`Failed to import products: ${error.message}`, 500);
  }
};
