import express from 'express';
import "dotenv/config"
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import listingRouter from "./routes/listingRoutes.js";
import chatRouter from "./routes/chatRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())

app.get('/', (req, res) => res.send('Server is running!'));

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/listing", listingRouter)
app.use("/api/chat", chatRouter)

// Export the app for serverless platforms
export default app;

// Only start the server when running in a traditional server environment
const isServerlessEnv = Boolean(
  process.env.VERCEL ||
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.K_SERVICE || // Cloud Run
  process.env.FUNCTION_TARGET // Google Cloud Functions
);

const PORT = process.env.PORT || 3000;

if (!isServerlessEnv) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}