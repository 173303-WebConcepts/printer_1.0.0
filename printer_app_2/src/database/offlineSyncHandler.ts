// src/database/offlineSyncHandler.ts
import NetInfo from "@react-native-community/netinfo";
import { syncProductsToServer } from "./services/productService";

// let hasSynced = false; // prevent duplicate sync loops

export function initializeOfflineSync(realm: Realm, isOnline: Boolean) {
  if (isOnline) {
    // hasSynced = true;

    const pending = realm.objects("Product").filtered('syncStatus = "pending"');

    if (pending.length > 0) {

      syncProductsToServer(realm);
    }
  }

//   if (!isOnline) {
//     hasSynced = false; // reset when offline again
//   }
}
