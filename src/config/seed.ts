import User from "../models/User";

const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@app.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

const seedAdmin = async (): Promise<void> => {
  try {
    const existing = await User.findOne({ role: "admin" });

    if (existing) {
      console.log("Admin account already exists. Skipping seed.");
      return;
    }

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });

    console.log(`Admin account seeded: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error("Failed to seed admin account:", error);
  }
};

export default seedAdmin;
