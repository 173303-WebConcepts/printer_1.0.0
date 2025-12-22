import { Helper } from "@/src/utils/Helper";
import uuid from "react-native-uuid";

export function saveImageToRealm(realm: Realm, uri: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const binary = await Helper.readImageAsBinary(uri);

      if (!binary) {
        return reject(new Error("Failed to read image binary"));
      }

      let imageObj = null;

      realm.write(() => {
        imageObj = realm.create("Image", {
          localId: uuid.v4(),
          binary: binary, // Uint8Array (recommended)
          mimeType: "image/jpeg", // You can pass dynamically if needed
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      resolve(imageObj);
    } catch (error) {
      console.error("saveImageToRealm error:", error);
      reject(error);
    }
  });
}
