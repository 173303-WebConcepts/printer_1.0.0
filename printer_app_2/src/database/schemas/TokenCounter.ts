import { Realm } from "realm";

export class TokenCounter extends Realm.Object<TokenCounter> {
  localId!: string; // <-- primary key remains fixed
  lastToken!: number;
  createdAt!: Date;
  updatedAt!: Date;

  static schema = {
    name: "TokenCounter",
    primaryKey: "localId",
    properties: {
      localId: "string",
      lastToken: { type: "int", default: 0 },
      createdAt: "date",
      updatedAt: "date",
    },
  };
}
