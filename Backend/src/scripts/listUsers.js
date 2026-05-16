import "../../src/config/env.js";
import mongoose from "mongoose";
import User from "../../src/models/User.js";

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Fetching users...");
    const users = await User.find({ role: { $in: ["donor", "ngo"] } }).limit(5);
    if (users.length === 0) {
      console.log("No users found in the database.");
    } else {
      users.forEach(user => {
        console.log(`Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

listUsers();
