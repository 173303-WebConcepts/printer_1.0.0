import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import {
  BACKEND_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  SESSION_SECRET,
  FRONTEND_URL,
  FRONTEND_URI,
  SMPT_PASSWORD,
  SMPT_MAIL,
  JWT_SECRET,
} from "../../config/index.js";
import { ApiError } from "../../utils/apiError.utils.js";
import User from "../../models/user/user.model.js";
import { Token } from "../../utils/token.utils.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";
import { Helper } from "../../utils/helper.utils.js";
import jwt, { Secret } from "jsonwebtoken";
import nodemailer from "nodemailer";
import OTP from "../../models/user/otp.model.js";
import { OTPVerrficationTemplate, ResetPasswordLinkTemplate } from "../../templates/index.js";
import { UserController } from "../../controllers/auth/user.controller.js";
import { UserService } from "./user.service.js";

const AuthService = {
  changePassword: async ({ userId, oldPassword, newPassword }: any) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // verify old password
    const isMatch = await bcrypt.compare(String(oldPassword), user.password);
    if (!isMatch) {
      throw new ApiError(400, "Current PIN is incorrect");
    }

    // simply assign new password (pre-save hook will hash)
    user.password = newPassword;
    await user.save();

    return new ApiResponse(200, { message: "PIN updated successfully" });
  },

  adminChangePassword: async ({ role, targetUserId, newPassword }: any) => {
    if (role !== "superAdmin" && role !== "admin") {
      throw new ApiError(403, "Only admins can change other users' password");
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      throw new ApiError(404, "Target user not found");
    }

    // ✅ Assign and mark as modified so pre-save hook runs
    user.password = String(newPassword).trim();
    user.markModified("password");

    await user.save();

    return new ApiResponse(200, {
      message: `Password reset successfully for ${user.name}`,
    });
  },

  register: async ({ name, password, phone, shopType }: any) => {
    const existingUser = await User.findOne({
      phone,
    });

    if (existingUser) {
      throw new ApiError(400, "User already exists with this phone");
    }

    // Calculate premium expiry: 1 year from now
    const premiumExpiryDate = new Date();
    premiumExpiryDate.setFullYear(premiumExpiryDate.getFullYear() + 1);

    const newUser = new User({
      name: name.toLowerCase(),
      password,
      phone,
      shopType,
      isPremium: true,
      premiumExpiry: premiumExpiryDate,
      // avatar,
    });

    await newUser.save();

    if (newUser) {
      const user = await User.findById(newUser._id);

      return new ApiResponse(201, { user });
    } else {
      throw new ApiError(400, "Failed to create new user");
    }
  },

  login: async ({ phone, password, res, isMobile = false }: any) => {
    const existingUser = await User.findOne({ phone }).select("+password +tokenVersion");

    if (!existingUser) {
      throw new ApiError(400, "Incorrect PIN. Please try again.");
    }

    if (existingUser?.isBlocked === true) {
      throw new ApiError(400, "You have been blocked.");
    }

    const verifiedPassword = await bcrypt.compare(String(password), existingUser.password);

    if (!verifiedPassword) {
      throw new ApiError(400, "Invalid phone or PIN");
    }

    const { accessToken } = await Token.generateToken(existingUser);

    // If request comes from website → use cookie
    if (!isMobile) {
      Helper.setCookie(accessToken, res);
    }

    const userDoc = await User.findById(existingUser._id).select("tokenVersion");

    if (!userDoc) {
      throw new ApiError(400, "Failed to login");
    }

    // increment tokenVersion
    userDoc.tokenVersion += 1;
    await userDoc.save();

    // convert to plain object
    const userObj = userDoc.toObject();

    // remove tokenVersion
    delete userObj.tokenVersion;

    if (userDoc) {
      return new ApiResponse(200, {
        user: userDoc,
        ...(isMobile && { token: accessToken, expiresIn: 864000 }), // only include token for mobile apps, expiresIn 10days
      });
    } else {
      throw new ApiError(400, "Failed to login");
    }
  },

  logout: async ({ userId }: any) => {
    const existingUser = await User.findById(userId).select("tokenVersion");

    if (!existingUser) {
      throw new ApiError(400, "User not found");
    }

    if (existingUser) {
      existingUser.tokenVersion += 1;
      await existingUser.save();

      return new ApiResponse(200, {});
    } else {
      throw new ApiError(400, "Failed to Logout");
    }
  },

  sendPasswordResetLink: async ({ email, userId }: any) => {
    let existingUser;

    if (userId) {
      existingUser = await User.findById(userId);
    } else {
      existingUser = await User.findOne({ email });
    }

    if (!existingUser) {
      throw new ApiResponse(400, "User not found");
    }

    // Token generation for reset password
    const token = jwt.sign({ _id: existingUser._id }, JWT_SECRET!, {
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
    } else {
      throw new ApiError(500, "Failed to update user with token");
    }
  },

  resetPassword: async ({ userId, token, password }: any) => {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      throw new ApiError(400, "User does not exist");
    }
    if (!existingUser.resetPasswordToken) {
      throw new ApiError(400, "Reset password link has been already used");
    }

    const verifyToken: any = jwt.verify(token, JWT_SECRET!);

    if (existingUser && verifyToken._id) {
      existingUser.password = password;
      existingUser.resetPasswordToken = "";
      await existingUser.save();

      return new ApiResponse(200, {}, "Password has been reset successfully");
    } else {
      throw new ApiError(500);
    }
  },

  resetPIN: async ({ email, newPIN, OTPCode }: any) => {
    // 1. Verify OTP
    const otpRecord = await OTP.findOne({ email });

    if (
      !otpRecord || // no OTP in DB
      otpRecord.otpCode !== Number(OTPCode)
    ) {
      throw new ApiError(400, "Invalid OTP or OTP has expired");
    }

    // 2. Find user
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      throw new ApiError(400, "User does not exist");
    }

    // simply assign new password (pre-save hook will hash)
    existingUser.password = newPIN;

    await existingUser.save();

    // 4. Delete used OTP
    await OTP.findOneAndDelete({ email });

    return new ApiResponse(200, {}, "PIN has been reset successfully");
  },

  sendVerificationCode: async ({ email }: any) => {
    const existingUser = await User.findOne({
      email,
    });

    if (!existingUser) {
      throw new ApiError(400, "User does not exist with this email.");
    }

    const existingCode = await OTP.findOne({ email });

    const OTPDigits = Math.floor(100000 + Math.random() * 900000); // 6 digit code

    let verification;

    if (existingCode) {
      verification = await OTP.findOneAndUpdate({ email }, { otpCode: OTPDigits }, { new: true, upsert: true });
    } else {
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

  verifyOTPCode: async ({ email, otpCode }: any) => {
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
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID!,
          clientSecret: GOOGLE_CLIENT_SECRET!,
          callbackURL: `${BACKEND_URL}/api/v1/auth/google/callback`,
          passReqToCallback: true,
        },
        async (
          req: any, // request object will be passed
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: VerifyCallback
        ) => {
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
          } catch (error) {
            return done(error, "Error");
          }
        }
      )
    );

    passport.serializeUser((user: any, done: (err: any, id?: string) => void) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done: (err: any, user?: any | null) => void) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  },

  googleAuthCallback: async (req: any, res: any) => {
    passport.authenticate("google", async (err: any, user: any) => {
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
      } catch (error) {
        // Handle token generation error
        res.redirect(`${FRONTEND_URL}/login?error=true`);
      }
    })(req, res);
  },

  GRefreshAccessToken: async ({ userId }: any) => {
    try {
      const user = await User.findById(userId).select("GRefreshToken");

      const data: any = {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: user?.GRefreshToken,
        grant_type: "refresh_token",
      };

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });

      if (!res.ok) {
        throw new ApiError(404, `Failed to refresh token: ${res.status}`);
      }

      const tokenData = await res.json();

      return new ApiResponse(200, tokenData);
    } catch (err: any) {
      throw new ApiError(404, `Error!`, err);
    }
  },

  GExchangeAuthCode: async ({ authCode, userId, email }: any) => {
    try {
      const data: any = {
        code: authCode,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: "",
        grant_type: "authorization_code",
      };

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new ApiError(404, `Google token exchange failed: ${errorText}`);
      }

      const tokenData = await res.json();

      const updateFields: any = {};

      if (email) updateFields.email = email;
      if (tokenData.refresh_token) {
        updateFields.GRefreshToken = tokenData.refresh_token;
      }

      await UserService.update({ updateFields, userId });

      return new ApiResponse(200, tokenData);
    } catch (err: any) {
      throw new ApiError(404, `Error!`, err);
    }
  },
};

export { AuthService };
