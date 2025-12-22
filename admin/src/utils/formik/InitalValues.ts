export class InitialValues {
  static register = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  static login = {
    phone: "",
    password: "",
  };

  static resetPassword = {
    password: "",
    confirmPassword: "",
  };

  static user = {
    name: "",
    password: "",
    phone: "",
    shopType: "",
    image: []
  };

  static shopSetup = {
    name: "",
    unit: "",
    purchasePrice: "",
    sellingPrice: "",
    tax: "",
    stock: "",
    isActive: true,
    categoryId: "",
    brandId: "",
    image: []
  };
}
