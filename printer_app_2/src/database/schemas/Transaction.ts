export const TransactionSchema = {
  name: "Transaction",
  primaryKey: "localId",
  properties: {
    localId: "string", // local UUID for offline use

    receiptNumber: "string?", // optional printable receipt number

    // Purchased products
    products: {
      type: "list",
      objectType: "TransactionItem",
    },

    subtotal: "double",
    tax: "double",
    total: "double",

    // Sync
    syncStatus: { type: "string", default: "pending" },
    createdAt: "date",
    updatedAt: "date",
  },
};

export const TransactionItemSchema = {
  name: "TransactionItem",
  embedded: true,
  properties: {
    localId: "string", // product localId
    name: "string",
    // image: "string",
    quantity: "int",
    sellingPrice: "double",
    total: "double",
  },
};
