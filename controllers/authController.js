const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");

const registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({
            email,
            password,
        });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        res.status(201).json({ token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "User creation failed" });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.scope('withPassword').findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN },
        );

        res.status(200).json({
            token: token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "email", "createdAt"],
        });
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        res.status(200).json(user);
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Server error"});
    }
};

module.exports = { registerUser, loginUser, getMe }