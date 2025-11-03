import { profileModel } from "../models/profile.js";
import responseHandler from "../utils/response.js";
import { validator } from "../utils/validator.js"; // import validator

export const profileController = {
  async getProfile(req, res) {
    try {
      const userId = req.user.user_id;
      const user = await profileModel.getUserProfile(userId);
      if (!user) {
        return responseHandler.notFound(res, "User not found");
      }
      return responseHandler.success(res, "Profile fetched successfully", user);
    } catch (err) {
      console.error(err);
      return responseHandler.internalServerError(res, "Internal server error");
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.user_id;
      let { full_name, phone, dob, gender, address, occupation, email } = req.body;

      // Normalize DOB: accept dd-mm-yyyy or dd/mm/yyyy and convert to yyyy-mm-dd
      if (typeof dob === 'string') {
        const m = dob.match(/^(\d{2})[-\/.](\d{2})[-\/.](\d{4})$/);
        if (m) {
          const [_, dd, mm, yyyy] = m;
          dob = `${yyyy}-${mm}-${dd}`; // yyyy-mm-dd
        }
      }

      // ✅ Validate input
      if (!validator.isValidName(full_name)) {
        return responseHandler.badRequest(res, "Full name is required");
      }

      if (!validator.isValidPhone(phone)) {
        return responseHandler.badRequest(res, "Invalid phone number format (must be 9–11 digits)");
      }

      if (!validator.isValidDate(dob)) {
        return responseHandler.badRequest(res, "Invalid date format for DOB or DOB is in the future");
      }

      if (!validator.isValidGender(gender)) {
        return responseHandler.badRequest(res, "Invalid gender value");
      }

      if (email && !validator.isEmail(email)) {
        return responseHandler.badRequest(res, "Invalid email format");
      }

      // ✅ Update model
      const updated = await profileModel.updateUserProfile(userId, {
        full_name,
        phone,
        dob,
        gender,
        address,
        occupation,
        email,
      });

      if (!updated) {
        return responseHandler.badRequest(res, "Update failed");
      }

      return responseHandler.success(res, "Profile updated successfully");
    } catch (err) {
      console.error(err);
      return responseHandler.internalServerError(res, "Internal server error");
    }
  },
};
