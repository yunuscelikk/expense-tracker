const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Expense, Category } = require("../models");
const { signAccessToken, signRefreshToken } = require("../utils/token");

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.create({
    email,
    password,
  });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
    },
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.scope("withPassword").findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await user.update({
      refreshToken: await bcrypt.hash(refreshToken, 10),
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const guestLogin = async (req, res) => {
  try {
    const uniqueId = Date.now() + "_" + Math.floor(Math.random() * 1000);
    const guestEmail = `guest_${uniqueId}@expenz.internal`;

    const guestUser = await User.create({
      email: guestEmail,
      password: null,
    });

    const accessToken = signAccessToken(guestUser.id);
    const refreshToken = signRefreshToken(guestUser.id);

    await guestUser.update({
      refreshToken: await bcrypt.hash(refreshToken, 10),
    });

    res
      .status(201)
      .json({ accessToken, refreshToken, user: { id: guestUser.id } });
  } catch (err) {
    // BURASI ÇOK ÖNEMLİ: Hatayı direkt kullanıcıya dönüyoruz
    res.status(500).json({
      error: "Failed to create guest session",
      message: err.message, // Hatanın açıklaması (Örn: "password cannot be null")
      sequelizeError: err.name, // Sequelize hatasının adı (Örn: "SequelizeDatabaseError")
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "email", "createdAt"],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const refreshTokenHandler = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const refreshToken = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findByPk(decoded.userId);

    if (!user || !user.refreshToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = signAccessToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);

    await user.update({
      refreshToken: await bcrypt.hash(newRefreshToken, 10),
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

const logout = async (req, res) => {
  await req.user.update({ refreshToken: null });
  res.status(200).json({ message: "Logged out" });
};

const deleteAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    await Expense.destroy({ where: { userId } });
    await Category.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Account deletion failed",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  refreshTokenHandler,
  logout,
  deleteAccount,
  guestLogin,
};
