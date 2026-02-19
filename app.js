const express = require("express");
const app = express();
const path = require("path");
const router = require("./routes/userRouter");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
  
const assetsPath = path.join(__dirname, "public/css");
app.use(express.static(assetsPath));

app.use("/", router);

const PORT = 3000;
app.listen(PORT, (error) => {
  if (error) {
    console.log("Error starting server:", error);
    throw error;
  }
  console.log(`Server running on port ${PORT}`);
});
