require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimit");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const errorHandler = require("./middleware/errorHandler");
const express = require('express');
const AppError = require("./utils/appError");
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
app.use("/categories", categoryRoutes);
app.use("/expenses", expenseRoutes);

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

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});


app.use(errorHandler);