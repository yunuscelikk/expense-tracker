require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimit");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const express = require('express');
const app = express();

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(apiLimiter);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("", categoryRoutes);
app.use("", expenseRoutes);


app.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "healty"
    });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});