const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

// Load env from .env.local
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

// Minimal User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = "admin@example.com";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`User ${email} already exists. Skipping.`);
      process.exit(0);
    }

    const password = "adminpassword123";
    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name: "Super Admin",
      email: email,
      passwordHash: passwordHash,
      role: "admin",
    });

    console.log("-----------------------------------------");
    console.log("✅ Admin user created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------");

  } catch (err) {
    console.error("Error creating admin user:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
