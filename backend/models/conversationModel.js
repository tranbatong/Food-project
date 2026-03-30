import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const conversationModel =
  mongoose.models.conversation ||
  mongoose.model("conversation", conversationSchema);
export default conversationModel;
