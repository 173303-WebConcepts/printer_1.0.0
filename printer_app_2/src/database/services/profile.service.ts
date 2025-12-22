import { Helper } from "@/src/utils/Helper";
import uuid from "react-native-uuid";
import { getRealm } from "../realmInstance";

export function createOfflineProfile(realm: Realm, profileData: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      let profile = null;

      realm.write(() => {
        profile = realm.create("Profile", {
          localId: String(uuid.v4()),
          // name,
          avatar: profileData?.image,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      resolve(profile);
    } catch (error) {
      console.error("saveImageToRealm error:", error);
      reject(error);
    }
  });
}

export async function updateOfflineProfile(updatedData: any): Promise<any> {
  try {
    const realm = getRealm();

    // Get the existing profile (only one stored)
    const existingProfile = realm.objects("Profile")[0];

    let updatedProfile = null;

    realm.write(() => {
      if (existingProfile) {
        // ⭐ Update existing profile
        existingProfile.avatar = updatedData?.image ?? existingProfile.avatar;
        // existingProfile.name = updatedData?.name ?? existingProfile.name;
        existingProfile.updatedAt = new Date();

        updatedProfile = existingProfile;
      }
    });

    return updatedProfile;
  } catch (error) {
    console.error("❌ updateOfflineProfile error:", error);
    return null;
  }
}

export async function getLocalProfile() {
  try {
    const realm = getRealm(); // ⬅ GLOBAL REALM INSTANCE

    const profiles = realm.objects("Profile");

    if (profiles.length === 0) return null;

    return profiles[0]?.toJSON(); // return the only profile
  } catch (error) {
    console.error("❌ getLocalProfile error:", error);
    return null;
  }
}
