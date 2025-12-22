export const CategorySchema = {
  name: "Category",
  primaryKey: "localId",
  properties: {
    localId: "string", // local UUID or server ID
    serverId: "string?", // server mongo _id
    name: "string",
    shopType: "string?", // store ObjectId as string
    createdAt: "date",
    updatedAt: "date",
    syncStatus: "string", // "synced" or "pending", "deleted", "updated"
  },
};
