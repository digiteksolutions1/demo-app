const jwt = require("jsonwebtoken");
require("dotenv").config();

//Generating Token
const generateToken = (user) => {
  const payload = {
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
};

//Verify Token

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    console.log("Error in verify token", err);
    throw err; // 🔥 This is the key line you were missing
  }
};

module.exports = { generateToken, verifyToken };
