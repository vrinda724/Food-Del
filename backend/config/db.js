import mongoose from "mongoose";

export const connectdb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Vrinda:18072005@cluster0.rl9g5nn.mongodb.net/food_del"
    );
    console.log("DB Connected");
  } catch (error) {
    console.log("DB connection failed:", error.message);
    process.exit(1);
  }
};
