import { profileModel } from "../models/profile.js";
import responseHandler from "../untils/response.js";

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
      const { full_name, phone } = req.body;

      if (!full_name || !phone) {
        return responseHandler.badRequest(res, "Full name and phone are required");
      }

      const phoneRegex = /^[0-9]{9,11}$/;
      if (!phoneRegex.test(phone)) {
        return responseHandler.badRequest(res, "Invalid phone number format");
      }

      const updated = await profileModel.updateUserProfile(userId, {
        full_name,
        phone,
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
