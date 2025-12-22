// src/database/productService.ts
import { axiosInstance } from "@/src/utils/axios";
import AppToast from "@/src/widgets/CustomToast";
import { Realm } from "@realm/react";
import uuid from "react-native-uuid";

// Product type
export interface ProductData {
  name: string;
  image: string;
  unit: object;
  purchasePrice?: number;
  sellingPrice: number;
  stock: number;
  brandId?: object;
  categoryId?: object;
  userId?: string;
}

// Server product type (from MongoDB)
export interface ServerProduct {
  _id: string;
  name: string;
  image: string;
  unit: string;
  purchasePrice?: number;
  sellingPrice: number;
  stock: number;
  isActive: boolean;
  brandId?: object;
  categoryId?: object;
  userId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// --------------------
// Fetch products from server & save offline
// --------------------
export async function fetchAndStoreServerProducts(realm: Realm) {
  try {
    const response = await axiosInstance.get("/product/all"); // your endpoint
    const serverProducts: ServerProduct[] = response.data?.data || [];

    // Save to realm
    saveProductsOffline(realm, serverProducts);


    return serverProducts;
  } catch (error: any) {

    return [];
  }
}

// --------------------
// Save products from server to local Realm
// --------------------
export function saveProductsOffline(realm: Realm, products: ServerProduct[]) {
  realm.write(() => {
    products.forEach(p => {
      realm.create(
        "Product",
        {
          localId: p._id, // use server _id
          serverId: p._id,
          name: p.name,
          image: p.image,
          unit: p.unit,
          purchasePrice: p.purchasePrice ?? 0,
          sellingPrice: p.sellingPrice,
          stock: p.stock,
          isActive: p.isActive,
          brandId: p.brandId,
          categoryId: p.categoryId,
          userId: p.userId,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          syncStatus: "synced",
        },
        "modified",
      );
    });
  });
}

// --------------------
// Sync offline products to MongoDB server
// --------------------
export async function syncProductsToServer(realm: Realm) {
  // Convert LIVE Realm results ➜ STATIC array
  const pendingProducts = [...realm.objects("Product").filtered('syncStatus = "pending"')];



  for (let p of pendingProducts) {

    try {
      const res = await axiosInstance.post("/product/create", {
        name: p.name,
        image: p.image,
        unit: p.unit?.value,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        isActive: p.isActive,
        brandId: p.brandId?.value || null,
        categoryId: p.categoryId?.value || null,
        userId: p.userId,
      });

      const serverData = res.data?.data;

      realm.write(() => {
        p.serverId = serverData._id;
        p.syncStatus = "synced";
        p.updatedAt = new Date();
      });


    } catch (err: any) {

    }
  }
}

// ---------------------------------------------------------------------
export async function createOfflineProduct(realm: any, productData: any) {
  try {
    const name = productData.name?.trim();

    // 🔍 Check duplicate (case-insensitive)
    const existing = realm.objects("Product").filtered("name ==[c] $0", name);

    if (existing.length > 0) {

      AppToast.error("Duplicate product", "Product with this name already exists");
      return null;
    }

    let createdProduct = null;

    realm.write(() => {
      createdProduct = realm.create("Product", {
        localId: uuid.v4(),
        serverId: null, // server will assign on sync

        name: productData.name.trim(),
        imageId: productData.image?.localId || "",
        unit: {
          label: productData.unit.label,
          value: productData.unit.value,
        },
        purchasePrice: Number(productData.purchasePrice),
        sellingPrice: Number(productData.sellingPrice),
        stock: Number(productData.stock || 0),
        isActive: productData.isActive ?? true,

        brandId: productData.brandId
          ? {
              label: productData.brandId.label,
              value: productData.brandId.value,
            }
          : null,

        categoryId: productData.categoryId
          ? {
              label: productData.categoryId.label,
              value: productData.categoryId.value,
            }
          : null,

        userId: productData.userId || null,

        createdAt: new Date(),
        updatedAt: new Date(),

        syncStatus: "pending", // 🔥 Needed for sync
      });
    });

    return createdProduct;
  } catch (error) {
    console.error("Failed to create offline product:", error);
    return null;
  }
}

export async function updateOfflineProduct(realm: any, localId: string, updates: any) {
  try {
    let updated = false;

    realm.write(() => {
      const product = realm.objectForPrimaryKey("Product", localId);



      if (!product) return;



      // --- Update fields conditionally ---
      // --- 🔥 IMAGE UPDATE (NEW) ---
      if (updates.image !== undefined && updates.image !== null) {
        const oldImage = product.image;
        const newImage = updates.image?.localId; // This is the Image object created earlier

        // Assign new image reference
        product.imageId = newImage;

        // Delete old image record
        if (oldImage) {
          realm.delete(oldImage);
        }
      }

      if (updates.name !== undefined) product.name = updates.name.trim();

      if (updates.unit) {
        product.unit = {
          label: updates.unit.label,
          value: updates.unit.value,
        };
      }

      if (updates.purchasePrice !== undefined) {
        product.purchasePrice = Number(updates.purchasePrice);
      }

      if (updates.sellingPrice !== undefined) {
        product.sellingPrice = Number(updates.sellingPrice);
      }

      if (updates.stock !== undefined) {
        product.stock = Number(updates.stock);
      }

      if (updates.isActive !== undefined) {
        product.isActive = updates.isActive;
      }

      if (updates.brandId) {
        product.brandId = {
          label: updates.brandId.label,
          value: updates.brandId.value,
        };
      }

      if (updates.categoryId) {
        product.categoryId = {
          label: updates.categoryId.label,
          value: updates.categoryId.value,
        };
      }

      if (updates.userId !== undefined) {
        product.userId = updates.userId;
      }

      // --- Mark sync flag ---
      if (product.syncStatus !== "pending") {
        product.syncStatus = "updated";
      }

      product.updatedAt = new Date();

      updated = true;
    });

    return updated;
  } catch (error: any) {

    return false;
  }
}

// ⬇️ Decrease stock for multiple products after receipt print
export async function updateOfflineProductStocks(realm: any, soldItems: any[]) {
  try {
    realm.write(() => {
      soldItems.forEach(item => {
        const product = realm.objectForPrimaryKey("Product", item.localId);
        if (!product) return;

        // Deduct stock (ensure never below 0)
        product.stock = Math.max(0, (product.stock || 0) - Number(item.quantity));

        // Mark for sync
        if (product.syncStatus !== "pending") {
          product.syncStatus = "updated";
        }

        product.updatedAt = new Date();
      });
    });

    return true;
  } catch (error: any) {

    return false;
  }
}

export async function deleteOfflineProduct(realm: Realm, localId: string) {
  try {
    realm.write(() => {
      const product = realm.objectForPrimaryKey("Product", localId);
      if (!product) return false;

      // ✅ Delete related image if exists
      if (product.imageId) {
        const image = realm.objectForPrimaryKey("Image", product.imageId);
        if (image) {
          realm.delete(image);
        }
      }

      // Delete product (embedded objects inside are auto-deleted)
      realm.delete(product);
    });

    return true;
  } catch (error) {
    console.error("Offline Product delete error:", error);
    return false;
  }
}

export async function getLocalProducts(
  realm: any,
  page: number,
  search: string,
  PAGE_SIZE: number = 10,
  filters?: { isActive?: boolean; categoryId?: string },
) {
  let results = realm.objects("Product");

  // --- 🔍 Search Filter ---
  if (search.trim() !== "") {
    results = results.filtered(`name CONTAINS[c] $0`, search.trim());
  }

  // --- ✅ isActive Filter ---
  if (filters?.isActive !== undefined) {
    results = results.filtered(`isActive == $0`, filters.isActive);
  }

  // --- 📂 Category Filter ---
  if (filters?.categoryId) {

    results = results.filtered(`categoryId.value == $0`, filters.categoryId?.value);
  }

  // --- 🔽 Sort by createdAt desc ---
  const sorted = results.sorted("createdAt", true);

  // --- 📄 Pagination ---
  const total = sorted.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageData = sorted.slice(start, end);

  // --- 🔹 Populate image by imageId ---
  const productsWithImages = pageData.map((product: any) => {
    let image = null;
    if (product.imageId) {
      image = realm.objectForPrimaryKey("Image", product.imageId)?.toJSON() ?? null;
    }
    return {
      ...product.toJSON(),
      image,
    };
  });

  return {
    products: productsWithImages,
    paginationData: {
      currentPage: page,
      totalPages,
      documentCount: total,
    },
  };
}

export async function syncProducts(realm: Realm) {


  const pendingItems = realm.objects("Product").filtered('syncStatus = "pending"');
  const updatedItems = realm.objects("Product").filtered('syncStatus = "updated"');
  const deletedItems = realm.objects("Product").filtered('syncStatus = "deleted"');

  const hasLocalChanges = pendingItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0;

  // Helper for mapping nullable relations
  const mapOptionalRelation = (obj: any) => {
    if (!obj) return null;
    return {
      label: obj.name || "",
      value: obj._id || null,
    };
  };

  // ---------- BUILD PAYLOAD ----------
  let payload = {
    create: [],
    update: [],
    delete: [],
  } as any;

  // CREATE
  if (pendingItems.length > 0) {
    payload.create = pendingItems.map((p: any) => ({
      name: p.name,
      image: p.image,
      unit: p.unit,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      isActive: p.isActive,
      brandId: p.brandId?.value || null,
      categoryId: p.categoryId?.value || null,
    }));
  }

  // UPDATE
  if (updatedItems.length > 0) {
    payload.update = updatedItems
      .filter(p => !!p.serverId)
      .map((p: any) => ({
        id: p.serverId,
        name: p.name,
        image: p.image,
        unit: p.unit,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        isActive: p.isActive,
        brandId: p.brandId?.value || null,
        categoryId: p.categoryId?.value || null,
      }));
  }

  // DELETE
  if (deletedItems.length > 0) {
    payload.delete = deletedItems.filter(p => !!p.serverId).map(p => p.serverId);
  }

  if (!hasLocalChanges) {

  }

  // ---------- SEND SYNC REQUEST ----------
  const res = await axiosInstance.post("/product/sync", payload);
  const { created, updated, deleted, serverUpdatesSinceLastSync } = res.data.data;

  // ---------- APPLY RESPONSE ----------
  realm.write(() => {
    // CREATED
    created?.forEach((item: any) => {
      const local = pendingItems.find(i => i.name === item.name);
      if (local) {
        local.serverId = item._id;
        local.syncStatus = "synced";
        local.updatedAt = new Date(item.updatedAt);
      }
    });

    // UPDATED
    updated?.forEach((item: any) => {
      const local = realm.objects("Product").filtered("serverId == $0", item._id)[0];
      if (local) {
        local.name = item.name;
        local.image = item.image;
        local.unit = mapOptionalRelation({ name: item.unit, _id: item.unit });
        local.purchasePrice = item.purchasePrice;
        local.sellingPrice = item.sellingPrice;
        local.stock = item.stock;
        local.isActive = item.isActive;

        // safe null-handling
        local.brandId = mapOptionalRelation(item.brand);
        local.categoryId = mapOptionalRelation(item.category);

        local.updatedAt = new Date(item.updatedAt);
        local.syncStatus = "synced";
      }
    });

    // DELETED
    deleted?.forEach((id: any) => {
      const local = realm.objects("Product").filtered("serverId == $0", id)[0];
      if (local) realm.delete(local);
    });



    // SERVER UPDATES
    serverUpdatesSinceLastSync?.forEach((item: any) => {
      const local = realm.objects("Product").filtered("serverId == $0", item._id)[0];

      if (local) {
        local.name = item.name;
        local.image = item.image;
        local.unit = mapOptionalRelation({ name: item.unit, _id: item.unit });
        local.purchasePrice = item.purchasePrice;
        local.sellingPrice = item.sellingPrice;
        local.stock = item.stock;
        local.isActive = item.isActive;

        // safe null-handling
        local.brandId = mapOptionalRelation(item.brand);
        local.categoryId = mapOptionalRelation(item.category);

        local.updatedAt = new Date(item.updatedAt);
        local.syncStatus = "synced";
      } else {
        realm.create("Product", {
          localId: uuid.v4(),
          serverId: item._id,
          name: item.name,
          image: item.image,
          unit: mapOptionalRelation({ name: item.unit, _id: item.unit }),
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          stock: item.stock,
          isActive: item.isActive,
          brandId: mapOptionalRelation(item.brand),
          categoryId: mapOptionalRelation(item.category),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          syncStatus: "synced",
        });
      }
    });
  });


}

function getStartDate(range: "1d" | "7d" | "month" | "year") {
  const now = new Date();

  switch (range) {
    case "1d":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);

    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);

    case "year":
      return new Date(now.getFullYear(), 0, 1);
  }
}

export async function getTopSellingProducts(
  realm: any,
  page: number,
  search: string,
  PAGE_SIZE: number = 10,
  filters: {
    isActive?: boolean;
    categoryId?: string;
    range: "1d" | "7d" | "month" | "year";
  },
) {
  const startDate = getStartDate(filters.range);

  // 1️⃣ Only non-deleted transactions in range
  const transactions = realm.objects("Transaction").filtered("createdAt >= $0 AND syncStatus != 'deleted'", startDate);

  // 2️⃣ Aggregate sales
  const salesMap: Record<string, { productId: string; quantity: number }> = {};

  transactions.forEach((txn: any) => {
    txn.products.forEach((item: any) => {
      if (!salesMap[item.localId]) {
        salesMap[item.localId] = {
          productId: item.localId,
          quantity: 0,
        };
      }
      salesMap[item.localId].quantity += item.quantity;
    });
  });

  // 3️⃣ Sort by quantity sold desc
  const sortedSales = Object.values(salesMap).sort((a, b) => b.quantity - a.quantity);

  // 4️⃣ Apply product-level filters (search, isActive, category)
  const filteredProducts = sortedSales
    .map(sale => {
      const product = realm.objectForPrimaryKey("Product", sale.productId);

      if (!product) return null;

      // 🔍 Search filter
      if (search?.trim() && !product.name.toLowerCase().includes(search.trim().toLowerCase())) {
        return null;
      }

      // ✅ isActive filter
      if (filters.isActive !== undefined && product.isActive !== filters.isActive) {
        return null;
      }

      // 📂 Category filter
      if (filters.categoryId && product.categoryId?.value !== filters.categoryId) {
        return null;
      }

      const image = product.imageId ? realm.objectForPrimaryKey("Image", product.imageId)?.toJSON() : null;

      return {
        ...product.toJSON(),
        image,
        soldQuantity: sale.quantity,
      };
    })
    .filter(Boolean);

  // 5️⃣ Pagination (after filtering)
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const products = filteredProducts.slice(start, start + PAGE_SIZE);

  return {
    products,
    paginationData: {
      currentPage: page,
      totalPages,
      documentCount: total,
    },
  };
}
