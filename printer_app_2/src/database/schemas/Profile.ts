import { Realm } from "realm";
import { Image } from "./Image";

export class Profile extends Realm.Object<Profile> {
  localId!: string;
  //   name!: string;
  avatar?: Image | null; // ← reference to Image object
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: "Profile",
    primaryKey: "localId",
    properties: {
      localId: "string",
      //   name: "string",
      avatar: "Image", // ← optional reference
      createdAt: "date",
      updatedAt: "date",
    },
  };
}
