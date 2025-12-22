import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { BACKEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL, JWT_SECRET, } from "../../config/index.js";
import { ApiError } from "../../utils/apiError.utils.js";
import User from "../../models/user/user.model.js";
import { Token } from "../../utils/token.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { Helper } from "../../utils/helper.utils.js";
import jwt from "jsonwebtoken";
import OTP from "../../models/user/otp.model.js";
import { OTPVerrficationTemplate, ResetPasswordLinkTemplate } from "../../templates/index.js";
const AuthService = {
    register: async ({ name, email, password, res, role, otpCode, phone }) => {
        if (role == "admin" || role == "superAdmin") {
            throw new ApiError(400, "Your are not authorized");
        }
        const existingUser = await User.findOne({
            email,
        });
        if (existingUser) {
            throw new ApiError(400, "User already exists with this email");
        }
        const verification = await OTP.findOne({ email });
        if (!verification) {
            throw new ApiError(400, "OTP code has been expired");
        }
        if (verification.otpCode !== Number(otpCode)) {
            throw new ApiError(400, "Incorrect OTP code");
        }
        // Delete the OTP record after successful verification
        await OTP.deleteOne({ email });
        const newUser = new User({
            name: name.toLowerCase(),
            email: email.toLowerCase(),
            role,
            password,
            phone
        });
        await newUser.save();
        if (newUser) {
            const { accessToken } = await Token.generateToken(newUser);
            const user = await User.findById(newUser._id);
            // Set token in HTTP-only cookie
            Helper.setCookie(accessToken, res);
            return new ApiResponse(201, { user });
        }
        else {
            throw new ApiError(400, "Failed to create new user");
        }
    },
    login: async ({ email, password, res }) => {
        const existingUser = await User.findOne({ email }).select("+password");
        if (!existingUser) {
            throw new ApiError(400, "Invalid email or password");
        }
        const verifiedPassword = await bcrypt.compare(password, existingUser.password);
        if (!verifiedPassword) {
            throw new ApiError(400, "Invalid email or password");
        }
        const { accessToken } = await Token.generateToken(existingUser);
        // Set token in HTTP-only cookie
        Helper.setCookie(accessToken, res);
        const user = await User.findById(existingUser._id);
        if (user) {
            return new ApiResponse(201, { user });
        }
        else {
            throw new ApiError(400, "Failed to login");
        }
    },
    sendPasswordResetLink: async ({ email, userId }) => {
        let existingUser;
        if (userId) {
            existingUser = await User.findById(userId);
        }
        else {
            existingUser = await User.findOne({ email });
        }
        if (!existingUser) {
            throw new ApiResponse(400, "Please check your mail box to reset your password");
        }
        // Token generation for reset password
        const token = jwt.sign({ _id: existingUser._id }, JWT_SECRET, {
            expiresIn: 300, // 5 min expiry
        });
        const updatedUser = await User.findByIdAndUpdate(existingUser._id, { resetPasswordToken: token }, { new: true });
        if (updatedUser) {
            // const link = `${FRONTEND_URL}/reset-password-link/${existingUser._id}/${token}`;
            const link = `${FRONTEND_URL}/reset-password-link?userId=${existingUser._id}&token=${updatedUser.resetPasswordToken}`;
            const to = existingUser.email;
            const subject = "Password Reset Instructions";
            await Helper.sendEmailMessage({
                email: to,
                subject: subject,
                ejsTemplate: ResetPasswordLinkTemplate,
                data: { link },
            });
            return new ApiResponse(200, {}, "Please check your mail box to reset your password");
        }
        else {
            throw new ApiError(500, "Failed to update user with token");
        }
    },
    resetPassword: async ({ userId, token, password }) => {
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw new ApiError(400, "User does not exist");
        }
        if (!existingUser.resetPasswordToken) {
            throw new ApiError(400, "Reset password link has been already used");
        }
        const verifyToken = jwt.verify(token, JWT_SECRET);
        if (existingUser && verifyToken._id) {
            existingUser.password = password;
            existingUser.resetPasswordToken = "";
            await existingUser.save();
            return new ApiResponse(200, {}, "Password has been reset successfully");
        }
        else {
            throw new ApiError(500);
        }
    },
    sendVerificationCode: async ({ email }) => {
        const existingUser = await User.findOne({
            email,
        });
        if (existingUser) {
            throw new ApiError(400, "User already exists with this email");
        }
        const existingCode = await OTP.findOne({ email });
        const OTPDigits = Math.floor(100000 + Math.random() * 900000); // 6 digit code
        let verification;
        if (existingCode) {
            verification = await OTP.findOneAndUpdate({ email }, { otpCode: OTPDigits }, { new: true, upsert: true });
        }
        else {
            verification = await OTP.create({ otpCode: OTPDigits, email });
        }
        if (!verification) {
            throw new ApiError(400, "Unable to create code");
        }
        const subject = "OTP Code";
        await Helper.sendEmailMessage({
            email: verification?.email,
            subject: subject,
            ejsTemplate: OTPVerrficationTemplate,
            data: { OTPDigits: verification.otpCode },
        });
        return new ApiResponse(200, {}, "Please check your email box. We have sent you OTP code.");
    },
    verifyOTPCode: async ({ email, otpCode }) => {
        const verification = await OTP.findOne({ email });
        if (!verification) {
            throw new ApiError(400, "OTP code has expired");
        }
        if (verification.otpCode !== otpCode) {
            throw new ApiError(400, "Incorrect OTP code");
        }
        return new ApiResponse(200, {});
    },
    googleAuth: async () => {
        passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: `${BACKEND_URL}/api/v1/auth/google/callback`,
            passReqToCallback: true,
        }, async (req, // request object will be passed
        accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({
                    email: profile.emails[0].value,
                });
                if (existingUser) {
                    // User with Google email already exists, log them in
                    return done(null, existingUser);
                }
                // Check if a user with this Google ID already exists
                const userWithGoogleId = await User.findOne({
                    googleId: profile.id,
                });
                if (userWithGoogleId) {
                    // User with Google ID already exists, log them in
                    return done(null, userWithGoogleId);
                }
                // If no user exists, create a new user with Google profile information
                const newUser = await User.create({
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    logo: profile.photos[0]?.value,
                    googleId: profile.id, // Store the Google ID to link accounts
                });
                return done(null, newUser);
            }
            catch (error) {
                return done(error, "Error");
            }
        }));
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });
        passport.deserializeUser(async (id, done) => {
            try {
                const user = await User.findById(id);
                done(null, user);
            }
            catch (error) {
                done(error, null);
            }
        });
    },
    googleAuthCallback: async (req, res) => {
        passport.authenticate("google", async (err, user) => {
            if (err || !user) {
                // Handle error
                return res.redirect(`${FRONTEND_URL}/login?error=true`);
            }
            try {
                // Generate JWT token for the authenticated user
                const { accessToken } = await Token.generateToken(user);
                Helper.setCookie(accessToken, res);
                // Redirect to frontend
                res.redirect(`${FRONTEND_URL}/?isAuthenticated=true`);
            }
            catch (error) {
                // Handle token generation error
                res.redirect(`${FRONTEND_URL}/login?error=true`);
            }
        })(req, res);
    },
};
export { AuthService };
//# sourceMappingURL=auth.service.js.map