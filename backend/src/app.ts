import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
// import { Server } from "socket.io";
// import http from "http";
import { SESSION_SECRET } from "./config/index.js";
import session from "express-session";
import passport from "passport";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// const httpServer = http.createServer(app);

const CORSORIGINS = ["https://sf-main.vercel.app", "https://sf-admin-panel.vercel.app", "http://localhost:3000", "http://localhost:3001"];

// Initialize Google OAuth
AuthService.googleAuth();

// const io = new Server(httpServer, {
//   // pingInterval: 5000, // Send a ping every 5 seconds
//   // pingTimeout: 2000,  // Close connection if no pong is received within 2 seconds
//   // transports: ['websocket'],
//   // secure: true, // if using HTTPS
//   cors: {
//     origin: CORSORIGINS,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true
//   },
// });

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || CORSORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Use express-session middleware
app.use(
  session({
    secret: SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/payment/webhook", bodyParser.raw({ type: "*/*" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use("/images", express.static(path.join(__dirname, "..", "public", "images")));

app.use(cookieParser());

// Routes
import { AuthService } from "./services/auth/auth.service.js";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { categoryRouter } from "./routes/category.routes.js";
import { commonRouter } from "./routes/common.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";
import { productRouter } from "./routes/product.routes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/common", commonRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/product", productRouter);

app.get("/", (_req: Request, res: Response): any => {
  return res.send("Express Typescript on Vercel 11");
});
app.get("/ping", (_req: Request, res: Response): any => {
  return res.send("pong 🏓");
});

// Generic error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
    stack: err.stack,
  });
});

// export { io, httpServer };
export { app };
