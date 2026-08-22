import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    /**
     * passwordHash: stored as bcrypt hash.
     * `select: false` prevents it from being returned in normal queries.
     * To read it, use: User.findOne({...}).select("+passwordHash")
     */
    passwordHash: {
      type: String,
      select: false,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    favorites: [{ type: Number }], // Array of TMDB IDs
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
