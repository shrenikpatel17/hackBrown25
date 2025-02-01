import mongoose, { Document, model, Model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    firstName: {
      type: String, 
      required: true,
      minlength: 2, 
      maxlength: 50, 
    },
    lastName: {
      type: String, 
      required: true,
      minlength: 2, 
      maxlength: 50, 
    },
    email: {
      type: String, 
      required: true,
      maxlength: 50, 
      unique: true,
    },
    password: {
      type: String, 
      required: true,
      minlength: 5, 
    },
    stories: {
      type: Array, // Array of {title: String, sceneParts: [...], sceneImagePrompts: [...], sceneImageURLS: [...], choices: [{choice1, choice2}, ...] }
      default: [],
    },
    points: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || model("User", UserSchema);

export default User;