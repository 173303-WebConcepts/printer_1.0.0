import { getRealm } from "../realmInstance";

export function initializeTokenCounter() {
  const realm = getRealm();

  const existing = realm.objectForPrimaryKey("TokenCounter", "token-counter");

  if (!existing) {
    realm.write(() => {
      realm.create("TokenCounter", {
        localId: "token-counter",
        lastToken: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }
}

export function getNextTokenNumber(): number {
  const realm = getRealm();
  const counter: any = realm.objectForPrimaryKey("TokenCounter", "token-counter");

  const next = counter.lastToken + 1;

  realm.write(() => {
    counter.lastToken = next;
    counter.updatedAt = new Date();
  });

  return next;
}
