import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";



const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id, role }, secret, { expiresIn } as jwt.SignOptions);
};

const setTokenCookie = (res: Response, token: string): void => {
  res.cookie("token", token, {
    httpOnly: true,                                      
    secure: process.env.NODE_ENV === "production",       
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,                   
  });
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};



export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Please provide name, email, and password." });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ message: "Please provide a valid email address." });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters." });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "A user with this email already exists." });
      return;
    }

    const user = await User.create({ name, email, password, role: "customer" });

    const token = generateToken(user._id.toString(), user.role);
    setTokenCookie(res, token);

    res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};



export const addSupport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Please provide name, email, and password." });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ message: "Please provide a valid email address." });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters." });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "A user with this email already exists." });
      return;
    }

    const user = await User.create({ name, email, password, role: "support" });

    res.status(201).json({
      message: "Support user created successfully.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Add support error:", error);
    res.status(500).json({ message: "Server error while creating support user." });
  }
};



export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please provide email and password." });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);
    setTokenCookie(res, token);

    
    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};



export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully." });
};



export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (email && !isValidEmail(email)) {
    res.status(400).json({ message: "Please provide a valid email address." });
    return;
  }

  try {
    
    const updates: { name?: string; email?: string } = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No valid fields to update." });
      return;
    }

    
    if (email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: id } });
      if (emailTaken) {
        res.status(409).json({ message: "This email is already in use." });
        return;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,           
      runValidators: true, 
    }).select("-password");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({ message: "User updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error during update." });
  }
};


export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (req.user?.id !== id) {
    res.status(403).json({ message: "You are not allowed to delete another user's account." });
    return;
  }

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.clearCookie("token");
    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error during deletion." });
  }
};



export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (req.user?.id !== id) {
    res.status(403).json({ message: "You are not allowed to update another user's password." });
    return;
  }

  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: "Please provide both current and new passwords." });
    return;
  }

  if (currentPassword === newPassword) {
    res.status(400).json({ message: "New password must be different from the current password." });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ message: "New password must be at least 6 characters." });
    return;
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid current password." });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error during password update." });
  }
};

