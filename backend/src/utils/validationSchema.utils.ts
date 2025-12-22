import Joi, { Schema } from "joi";

const phoneRegExp = /^(?:\+92|0092|0)?3[0-9]{9}$/;

interface RegisterSchema {
  userName: string;
  email: string;
  password: string;
}

interface LoginSchema {
  email: string;
  password: string;
}

interface RefreshTokenSchema {
  refreshToken: string;
}

interface CreateCategorySchema {
  categoryName?: string;
}

interface ValidationSchemas {
  registerSchema: Schema<RegisterSchema>;
  loginSchema: Schema<LoginSchema>;
  refreshTokenSchema: Schema<RefreshTokenSchema>;
  createCategorySchema: Schema<CreateCategorySchema>;
}

const skinDetailsSchema = Joi.object({
  noOfUpgradedWaponsSkins: Joi.number().min(1).max(2000).messages({
    "number.min": "Value must be between 1-2,000",
    "number.max": "Value must be between 1-2,000",
  }),
  noOfMethics: Joi.number()
    .min(1)
    .max(20000)
    .messages({
      "number.min": "Value must be between 1-20,000",
      "number.max": "Value must be between 1-20,000",
    })
    .required(),
  noOfVechicleSkins: Joi.number().min(1).max(10000).messages({
    "number.min": "Value must be between 1-10,000",
    "number.max": "Value must be between 1-10,000",
  }),
  noOfHelmetsSkins: Joi.number().min(1).max(10000).messages({
    "number.min": "Value must be between 1-10,000",
    "number.max": "Value must be between 1-10,000",
  }),
  noOfBackpackSkins: Joi.number().min(1).max(10000).messages({
    "number.min": "Value must be between 1-10,000",
    "number.max": "Value must be between 1-10,000",
  }),
  noOfCharacterSkins: Joi.number().min(1).max(3000).messages({
    "number.min": "Value must be between 1-3,000",
    "number.max": "Value must be between 1-3,000",
  }),
});

// PUBG Schema
const pubgSchema = Joi.object({
  pubgProductType: Joi.string().valid("account", "item").required(),

  accountLevel: Joi.when("pubgProductType", {
    is: "account",
    then: Joi.number().min(40).max(100).required(),
    otherwise: Joi.forbidden(),
  }),

  linkedSocialAccounts: Joi.when("pubgProductType", {
    is: "account",
    then: Joi.array().items(Joi.object()).min(1).required(),
    otherwise: Joi.forbidden(),
  }),

  skinDetails: Joi.when("pubgProductType", {
    is: "account",
    then: skinDetailsSchema,
    otherwise: Joi.forbidden(),
  }),
});

const ValidationSchema: any = {
  pubgAccount: Joi.object<any>({
    title: Joi.string().min(5).max(90).required(),
    images: Joi.array().items(Joi.string()).min(1).max(6).required(),
    price: Joi.number().strict().min(500).max(2000000).required(),
    descriptionContent: Joi.object().required(),

    pubg: pubgSchema.required(),

    // pubg: Joi.when("digitalProductType", {
    //   is: "pubg",
    //   then: pubgSchema.required(),
    //   otherwise: Joi.forbidden(),
    // }),

    // pricingType: Joi.string().valid("fixed", "bid", "fixed-and-bid").required(),
    // prodType: Joi.string().valid("physical", "digital").required(),
    // auctionEndDate: Joi.date().optional(),
    // digitalProductType: Joi.when("prodType", {
    //   is: "digital",
    //   then: Joi.string().valid("pubg", "tik-tok", "youtube", "instagram", "facebook", "website").required(),
    //   otherwise: Joi.forbidden(),
    // }),
  }),

  vefificationCode: Joi.object<any>({
    email: Joi.string().email().required().messages({
      "string.email": "Must be a valid email",
      "any.required": "Email is required",
    }),
  }),

  registerSchema: Joi.object<any>({
    name: Joi.string()
      .min(3) // Minimum length of 3
      .max(30) // Maximum length of 30
      // .pattern(/^[a-zA-Z ]+$/, "alphabetic and spaces") // Allow alphabetic characters and spaces
      .required()
      .messages({
        "string.min": "Name must be at least 3 characters long.",
        "string.max": "Name must be less than or equal to 30 characters.",
        "string.pattern.base": "Name must contain only alphabetic characters.", // Custom message for pattern error
        "any.required": "Name is required.",
      }),

    phone: Joi.string().pattern(phoneRegExp).required().messages({
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
      "string.pattern.base": "Invalid Pakistani phone number format",
    }),

    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
    // role: Joi.string().valid("user").default("buyer").required().messages({
    //   "any.required": "The role is required.",
    //   "any.only": "Role must be either 'user'",
    // }),

    shopType: Joi.alternatives()
      .try(
        Joi.string().trim().allow(null, ""), // allow empty string or null
        Joi.object().allow(null) // also safe if it’s an object (e.g., from frontend select)
      )
      .messages({
        "string.base": "Invalid shopType format",
      }),

    avatar: Joi.string().trim().optional().messages({
      "string.base": "Avatar must be a string.",
    }),
  }),

  loginSchema: Joi.object<any>({
    phone: Joi.string().pattern(phoneRegExp).required().messages({
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
      "string.pattern.base": "Invalid Pakistani phone number format",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  protectedSchema: Joi.object<any>({}),

  sendPasswordResetLinkSchema: Joi.object({
    email: Joi.string()
      .email()
      .optional() // Optional but must be valid email if provided
      .messages({
        "string.email": "Must be a valid email address.",
      }),

    userId: Joi.string()
      .hex() // Ensures the userId is a valid MongoDB ObjectId (if using MongoDB)
      .length(24) // MongoDB ObjectIds are 24 characters long
      .optional() // Optional but must match the ObjectId pattern if provided
      .messages({
        "string.hex": "UserId must be a valid ObjectId.",
        "string.length": "UserId must be 24 characters long.",
      }),
  })
    .xor("email", "userId") // Ensure either 'email' or 'userId' is provided, but not both
    .messages({
      "object.xor": "Either 'email' or 'userId' must be provided, but not both.",
    }),

  resetPasswordSchema: Joi.object({
    // Query parameters validation
    // userId: Joi.string()
    //   .hex() // Validates MongoDB ObjectId format
    //   .length(24) // MongoDB ObjectIds are 24 characters long
    //   .required() // UserId is required in query
    //   .messages({
    //     "string.hex": "UserId must be a valid ObjectId.",
    //     "string.length": "UserId must be 24 characters long.",
    //     "any.required": "UserId is required.",
    //   }),

    // token: Joi.string()
    //   .required() // Token is required in query
    //   .messages({
    //     "any.required": "Token is required.",
    //   }),

    // Body parameters validation
    password: Joi.string()
      .min(8) // Minimum length for password
      .required() // Password is required in body
      .messages({
        "string.min": "Password must be at least 8 characters.",
        "any.required": "Password is required.",
      }),
  }).messages({
    "object.unknown": "Invalid query or body parameters.",
  }),
};

export { ValidationSchema };
