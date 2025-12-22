import uuid from "react-native-uuid";
import { getRealm } from "../realmInstance";

export async function createOfflineSettings(): Promise<any> {
  try {
    const realm = getRealm();

    // Check if already exists
    const existing = realm.objects("Settings")[0];
    if (existing) return existing.toJSON(); // ✅ always return JSON

    let settings: any = null;

    realm.write(() => {
      settings = realm.create("Settings", {
        localId: String(uuid.v4()),
        // defaults from schema will auto-apply
      });
    });

    return settings.toJSON(); // ✅ return JSON after creation
  } catch (error) {
    console.error("❌ createOfflineSettings error:", error);
    return null;
  }
}

export async function updateOfflineSettings(updatedData: Partial<any>): Promise<any> {
  try {
    const realm = getRealm();

    const settings = realm.objects("Settings")[0];
    if (!settings) return null;

    realm.write(() => {
      if (updatedData.isKOT !== undefined) settings.isKOT = updatedData.isKOT;

      if (updatedData.isTokenNumber !== undefined) settings.isTokenNumber = updatedData.isTokenNumber;

      if (updatedData.dayStart !== undefined) settings.dayStart = updatedData.dayStart;

      if (updatedData.dayEnd !== undefined) settings.dayEnd = updatedData.dayEnd;

      if (updatedData.backupNotice !== undefined) settings.backupNotice = updatedData.backupNotice;
      if (updatedData.tax !== undefined) settings.tax = updatedData.tax;
    });

    return settings.toJSON();
  } catch (error) {
    console.error("❌ updateOfflineSettings error:", error);
    return null;
  }
}

export async function getLocalSettings(): Promise<any> {
  try {
    const realm = getRealm();

    const settings = realm.objects("Settings");

    if (settings.length === 0) return null;

    return settings[0]?.toJSON();
  } catch (error) {
    console.error("❌ getLocalSettings error:", error);
    return null;
  }
}
