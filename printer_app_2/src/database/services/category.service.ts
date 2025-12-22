import { axiosInstance } from "@/src/utils/axios";
import AppToast from "@/src/widgets/CustomToast";
import { Realm } from "@realm/react";
import uuid from "react-native-uuid";

export interface ServerCategory {
  _id: string;
  name: string;
  shopType?: string;
  users?: { user: string }[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * ---------------------------------------------------------------
 * Fetches all server-side categories for the user and stores them
 * offline in Realm. Updates local cache only when server data exists.
 * ---------------------------------------------------------------
 */
export async function fetchAndStoreServerCategories(realm: Realm) {
  try {
    const res = await axiosInstance.get("/category/user-categories");
    const serverCategories: ServerCategory[] = res.data?.data?.categories || [];

    if (res.data?.success && res.data?.data?.categories?.length > 0) {
      saveCategoriesOffline(realm, serverCategories);
    }
    return serverCategories;
  } catch (err: any) {

    return [];
  }
}

/**
 * ---------------------------------------------------------------
 * Saves server categories into Realm storage.
 * Updates existing records by serverId or creates new ones,
 * ensuring all fields and sync state remain accurate.
 * ---------------------------------------------------------------
 */
export function saveCategoriesOffline(realm: Realm, categories: ServerCategory[]) {
  realm.write(() => {
    categories.forEach(c => {
      const existing = realm.objects("Category").filtered("serverId == $0", c._id)[0];

      if (existing) {
        // Update existing
        existing.name = c.name;
        existing.shopType = c.shopType?._id || null;
        existing.updatedAt = new Date(c.updatedAt);
        existing.syncStatus = "synced";
      } else {
        // Create new
        realm.create("Category", {
          localId: uuid.v4(),
          serverId: c._id,
          name: c.name,
          shopType: c.shopType?._id || null,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          syncStatus: "synced",
        });
      }
    });
  });
}

/**
 * ---------------------------------------------------------------
 * Creates multiple categories in a single Realm transaction.
 * Skips duplicates, counts successful inserts, and shows toast messages.
 * ---------------------------------------------------------------
 */
export function createMultipleOfflineCategories(realm: Realm, categories: string[]) {
  try {
    // 1. Load all existing category names once
    const existingNames = new Set(realm.objects("Category").map(c => c.name.toLowerCase()));

    // 2. Normalize + filter out duplicates
    const newCategories = categories.map(name => name.trim().toLowerCase()).filter(name => name.length > 0 && !existingNames.has(name));

    let createdCount = 0;

    // 3. Write only the new items
    if (newCategories.length > 0) {
      realm.write(() => {
        newCategories.forEach(name => {
          realm.create("Category", {
            localId: uuid.v4(),
            serverId: null,
            name,
            createdAt: new Date(),
            updatedAt: new Date(),
            syncStatus: "pending",
          });

          createdCount++;
        });
      });
    }

    // ===== Toast messages =====
    if (createdCount > 0) {
      AppToast.success("Success!", `${createdCount} categor${createdCount > 1 ? "ies" : "y"} created successfully`);
    } else {
      AppToast.error("Category Exist", "No categories created. All categories already exist.");
    }

    return createdCount;
  } catch (error: any) {
    AppToast.error("Write Failed!", error?.message ?? "Something went wrong while saving categories.");
  }
}

/**
 * ---------------------------------------------------------------
 * Update only the category name offline.
 * Marks the record as "updated" for later syncing.
 * ---------------------------------------------------------------
 */
export async function updateOfflineCategory(realm: Realm, localId: string, name: string) {
  try {
    let updated = false;

    realm.write(() => {
      const category = realm.objectForPrimaryKey("Category", localId);

      if (!category) return;

      // Change only name
      category.name = name.toLowerCase().trim();

      // Mark as updated (only if not new)
      if (category.syncStatus !== "pending") {
        category.syncStatus = "updated";
      }

      category.updatedAt = new Date();
      updated = true;
    });

    return updated;
  } catch (error: any) {

    return false;
  }
}

/**
 * ---------------------------------------------------------------
 * Soft-deletes a category in Realm by marking syncStatus = "deleted".
 * Wrapped in try/catch to safely handle Realm write failures.
 * ---------------------------------------------------------------
 */
export async function deleteOfflineCategory(realm: Realm, localId: string) {
  try {
    let deleted = false;

    realm.write(() => {
      const category = realm.objectForPrimaryKey("Category", localId);
      if (!category) return false;

      // Hard delete from Realm
      realm.delete(category);

      //  category.syncStatus = "deleted"; // mark for server deletion
      // category.updatedAt = new Date();
      // deleted = true;

      deleted = true;
    });

    return deleted;
  } catch (error: any) {

    return false;
  }
}

/**
 * ---------------------------------------------------------------
 * Fetches local Realm categories with search, pagination, and
 * exclusion of deleted items. Results are sorted by updatedAt (desc).
 * ---------------------------------------------------------------
 */
export async function getLocalCategories(realm: any, page?: number, search: string = "") {
  let results = realm.objects("Category");

  // Exclude deleted categories
  // results = results.filtered(`syncStatus != "deleted"`);

  // Apply search filter
  if (search.trim() !== "") {
    results = results.filtered(`name CONTAINS[c] $0`, search.trim());
  }

  // Sort by createdAt (desc)
  const sorted = results.sorted("createdAt", true);

  // If page is NOT provided → return ALL results
  if (!page) {
    return {
      categories: sorted,
      paginationData: null, // or {} if you prefer
    };
  }

  // Pagination
  const PAGE_SIZE = 10;
  const total = sorted.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const pageData = sorted.slice(start, end);

  return {
    categories: pageData,
    paginationData: {
      currentPage: page,
      totalPages,
      documentCount: total,
    },
  };
}

export function hasPendingCategoryChanges(realm: Realm) {
  return realm.objects("Category").filtered('syncStatus == "pending" OR syncStatus == "updated" OR syncStatus == "deleted"').length > 0;
}

export async function syncCategories(realm: Realm) {


  // --- 1. Load all pending local changes ---
  const pendingItems = realm.objects("Category").filtered('syncStatus = "pending"');
  const updatedItems = realm.objects("Category").filtered('syncStatus = "updated"');
  const deletedItems = realm.objects("Category").filtered('syncStatus = "deleted"');

  const hasLocalChanges = pendingItems.length > 0 || updatedItems.length > 0 || deletedItems.length > 0;

  console.log("Local changes:", {
    pending: pendingItems.length,
    updated: updatedItems.length,
    deleted: deletedItems.length,
  });

  // --- Build payload only if needed ---
  let payload = {
    create: [],
    update: [],
    delete: [],
  } as any;

  if (pendingItems.length > 0) {
    payload.create = pendingItems.map((item: any) => item.name.trim().toLowerCase());
  }

  if (updatedItems.length > 0) {
    payload.update = updatedItems
      .filter(i => !!i.serverId)
      .map(i => ({
        id: i.serverId,
        name: i.name,
      }));
  }

  if (deletedItems.length > 0) {
    payload.delete = deletedItems.filter(i => !!i.serverId).map(i => i.serverId);
  }

  // --- 2. Avoid calling API if nothing to sync ---
  if (!hasLocalChanges) {

  }

  const res = await axiosInstance.post("/category/sync", payload);

  const { created, updated, deleted, serverUpdatesSinceLastSync } = res.data.data;



  // --- 3. Apply all changes in 1 transaction ---
  realm.write(() => {
    // ----- Handle local pending → synced -----
    created?.forEach((item: any) => {
      const local = pendingItems.find(i => i.name === item.name);
      if (local) {
        local.serverId = item._id;
        local.syncStatus = "synced";
        local.updatedAt = new Date(item.updatedAt);
      }
    });

    // ----- Handle local updated → synced -----
    updated?.forEach((item: any) => {
      const local = realm.objects("Category").filtered("serverId == $0", item.id)[0];

      if (local) {
        // local.name = item.name;
        // local.updatedAt = new Date(item.updatedAt);
        local.syncStatus = "synced";
      }
    });

    // ----- Handle deletions -----
    deleted?.forEach((id: string) => {
      const found = realm.objects("Category").filtered("serverId == $0", id)[0];
      if (found) realm.delete(found);
    });

    // ----- Apply server updates since last sync -----
    serverUpdatesSinceLastSync?.forEach((item: any) => {
      const local = realm.objects("Category").filtered("serverId == $0", item._id)[0];

      if (local) {
        local.name = item.name;
        local.shopType = item.shopType?._id || null;
        local.updatedAt = new Date(item.updatedAt);
        local.syncStatus = "synced";
      } else {
        // New category from server
        realm.create("Category", {
          localId: uuid.v4(),
          serverId: item._id,
          name: item.name,
          shopType: item.shopType?._id || null,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          syncStatus: "synced",
        });
      }
    });
  });


}
