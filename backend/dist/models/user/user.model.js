import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";
const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true, // Ensures unique index ignores `null` or undefined values
        unique: true, // Enforces uniqueness for non-null values
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        select: false,
    },
    avatar: {
        type: String,
    },
    googleId: {
        type: String,
    },
    resetPasswordToken: {
        type: String,
    },
    isBlocked: {
        type: Boolean,
    },
    isFreeTial: {
        type: Boolean, // 15 days
    },
    isPremium: {
        type: Boolean,
    },
    premiumExpiry: {
        type: Date,
    },
    role: {
        type: String,
        enum: ["superAdmin", "admin", "user"],
        required: true,
        default: "user",
    },
    shopType: { type: Schema.Types.ObjectId, ref: "ShopType" },
}, {
    timestamps: true,
});
// Middleware to hash the password before saving
userSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
    }
    next();
});
const User = model("User", userSchema);
export default User;
//# sourceMappingURL=user.model.js.map