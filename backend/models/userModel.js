import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      image_url: {
        type: String,
        trim: true,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    about: {
      type: String,
      required: false,
      default: "",
    },
    chatWallpaper: {
      image_url: {
        type: String,
        default: "",
        trim: true,
      },
      public_id: {
        type: String,
        default: "",
      },
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
