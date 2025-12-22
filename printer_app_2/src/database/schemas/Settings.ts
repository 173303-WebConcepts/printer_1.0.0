import { Realm } from "realm";

export class Settings extends Realm.Object<Settings> {
  localId!: string;

  isKOT!: boolean;
  isTokenNumber!: boolean;

  dayStart!: string;
  dayEnd!: string;

  backupNotice!: number;

  static schema: Realm.ObjectSchema = {
    name: "Settings",
    primaryKey: "localId",
    properties: {
      localId: "string",

      isKOT: { type: "bool", default: true },
      isTokenNumber: { type: "bool", default: true },

      dayStart: { type: "string", default: "06:00 PM" },
      dayEnd: { type: "string", default: "06:00 AM" },

      backupNotice: { type: "int", default: 5 },
      tax: { type: "int", default: 0 }, // Tax %
    },
  };
}
