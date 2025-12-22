import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory name from the file URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Get the directory name

// const sellerOnboardingTemplate = fs.readFileSync(
//   path.join(__dirname, "../templates/seller/onboarding.template.ejs"), // Adjust this path as necessary
//   "utf-8"
// );
// const sellerOnboardingStatusTemplate = fs.readFileSync(
//   path.join(__dirname, "../templates/seller/onboardingStatus.template.ejs"), // Adjust this path as necessary
//   "utf-8"
// );
const OTPVerrficationTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/OTPVerrfication.template.ejs"), // Adjust this path as necessary
  "utf-8"
);
const ResetPasswordLinkTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/ResetPasswordLink.template.ejs"), // Adjust this path as necessary
  "utf-8"
);

export {
  //  sellerOnboardingTemplate, sellerOnboardingStatusTemplate,
  OTPVerrficationTemplate,
  ResetPasswordLinkTemplate,
};
