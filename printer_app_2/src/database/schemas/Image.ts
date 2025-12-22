import { Realm } from "realm";

export class Image extends Realm.Object<Image> {
  localId!: string;
  binary!: Uint8Array; // <-- Use Uint8Array (not ArrayBuffer)
  mimeType!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static schema = {
    name: "Image",
    primaryKey: "localId",
    properties: {
      localId: "string",
      binary: "data", // BINARY type
      mimeType: "string",
      createdAt: "date",
      updatedAt: "date",
    },
  };
}
