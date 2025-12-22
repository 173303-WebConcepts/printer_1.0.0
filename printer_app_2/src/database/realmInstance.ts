// src/database/realmInstance.ts
import Realm from "realm";
import { realmConfig } from "./RealmConfig";
import RNFS from "react-native-fs";

let realmInstance: Realm | null = null;

export const getRealm = (): Realm => {
  if (!realmInstance) {
    realmInstance = new Realm(realmConfig);
  }
  return realmInstance;
};

export const getRealmSize = async () => {
  try {
    const realm = getRealm();

    const stat = await RNFS.stat(realm.path);
    const sizeInBytes = Number(stat.size);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

    return sizeInMB;
  } catch (error) {
    console.error("Error getting Realm size:", error);
    return null;
  }
};
