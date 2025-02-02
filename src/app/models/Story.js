import mongoose, { Document, model, Model, Schema } from "mongoose";

const StorySchema = new Schema(
  {
    title: {
      type: String,
      default: "", 
    },
    scenePrompts: {
      type: Array, 
      default: [],
    },
    sceneImageURLs: {
      type: Array, 
      default: [],
    },
    choices: {
      type: Array,
      default: []
    },
    lessons: {
      type: Array,
      default: []
    },
    rhyme: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export const Story = mongoose.models.Story || model("Story", StorySchema);

export default Story;