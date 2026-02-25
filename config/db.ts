import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn("MONGO_URI is not defined. Skipping MongoDB connection.");
      return;
    }
    
    // Connect using Mongoose with the Stable API version options
    await mongoose.connect(uri, {
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      }
    });

    // Send a ping to confirm a successful connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } else {
      console.log("MongoDB Connected");
    }
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};
