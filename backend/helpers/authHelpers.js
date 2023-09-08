import jwt from "jsonwebtoken";
import { compare, hash } from "bcrypt";

const generateToken = (userId, email) => {
  const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  return token;
};

const createHashedPassword = async (password) => {
  let hashedPassword;
  try {
    hashedPassword = await hash(password, 10);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create hashed password.");
  }

  return hashedPassword;
};

const comparePassword = async (password, hashedPassword) => {
  let result;
  try {
    result = await compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Failed to compare password.");
  }

  return result;
};

export { generateToken, createHashedPassword, comparePassword };
