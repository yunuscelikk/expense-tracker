require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const express = require('express');
const app = express();

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