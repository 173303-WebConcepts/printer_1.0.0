export const ProductSchema = {
  name: "Product",
  primaryKey: "localId",
  properties: {
    localId: "string",
    serverId: "string?",
    name: "string",
    imageId: "string",
    unit: "UnitObject", // <-- NOT a string
    purchasePrice: "double",
    sellingPrice: "double",
    stock: "int",
    isActive: "bool",
    brandId: "BrandObject?", // <-- object
    categoryId: "CategoryObject?",
    userId: "string?",
    createdAt: "date",
    updatedAt: "date",
    syncStatus: "string",
  },
};

export const UnitObject = {
  name: "UnitObject",
  embedded: true,
  properties: {
    label: "string",
    value: "string",
  },
};

export const BrandObject = {
  name: "BrandObject",
  embedded: true,
  properties: {
    label: "string",
    value: "string",
  },
};

export const CategoryObject = {
  name: "CategoryObject",
  embedded: true,
  properties: {
    label: "string",
    value: "string",
  },
};
