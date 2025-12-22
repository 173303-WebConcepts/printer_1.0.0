import { model, Schema } from "mongoose";
const otpSchema = new Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
    },
    otpCode: { type: Number, required: true },
    otpCodeExpires: {
        type: Date,
        required: true,
        default: () => Date.now() + 5 * 60 * 1000, // 5 mins expiring time
    },
}, {
    timestamps: true,
});
// TTL Index for automatic deletion after 5 min
otpSchema.index({ otpCodeExpires: 1 }, { expireAfterSeconds: 60 * 5 });
const OTP = model("OTP", otpSchema);
export default OTP;
//# sourceMappingURL=otp.model.js.map