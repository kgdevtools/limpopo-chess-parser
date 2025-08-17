import express from "express";
import path from "path";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "views")));
app.use("/", uploadRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "views", "upload.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
