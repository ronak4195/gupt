import mongoose from "mongoose";

const dsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required:true
  },
  message: [
    {
      sender: {
        type: String,
      },
      data: {
        type: String,
      },
    },
  ],
});

const DS = mongoose.model("DS", dsSchema);

export default DS;
