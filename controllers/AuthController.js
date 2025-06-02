const { generateToken } = require("../auth/jwt");
const db = require("../database/db");
const APIResponse = require("../utils/APIResponse");
const hash = require("../utils/hash");

const AuthController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return APIResponse.error(
          res,
          null,
          "Email and password are required",
          400
        );
      }

      const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      if (users.length === 0) {
        return APIResponse.error(res, null, "No such user exists", 404);
      }

      const user = users[0];
      const isMatch = await hash.comparePassword(password, user.password);

      if (!isMatch) {
        return APIResponse.error(res, null, "Invalid Credentials", 401);
      }

      const accessToken = generateToken(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return APIResponse.suceess(
        res,
        {
          email: user.email,
          name: user.name,
          token: accessToken,
          expiresIn: "1d",
        },
        "Login Successful",
        200
      );
    } catch (err) {
      console.log("Login Error", err);
      return APIResponse.error(res, null, "Internal Server Error", 500);
    }
  },
  async logout(req, res) {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
      });

      return APIResponse.suceess(res, null, "Logout Successful", 200);
    } catch (err) {
      console.log("Logout Error", err);
      return APIResponse.error(res, null, "Internal Server Error", 500);
    }
  },
};

module.exports = AuthController;
