import chalk from "chalk";
import mongoose from "mongoose";
import { DEV_MONGODB_URI, NODE_ENV, PORT, PRO_MONGODB_URI } from "../config/index.js";

// import { httpServer } from "../app.js";
import { app } from "../app.js";
import { DB_NAME_DEV, DB_NAME_PRO } from "../utils/constants.utils.js";

const DB_URI = NODE_ENV === "pro" ? PRO_MONGODB_URI : DEV_MONGODB_URI;
const DB_NAME = NODE_ENV === "pro" ? DB_NAME_PRO : DB_NAME_DEV;

async function connectToDB(): Promise<void> {
  try {
    const connectionInstance = await mongoose.connect(`${DB_URI}/${DB_NAME}?retryWrites=true&w=majority&appName=BDICluster`);
    console.log(
      chalk.yellow.underline.bold(
        "Connected to the database for",
        `'${NODE_ENV}'`,
        "mode",
        `${connectionInstance.connection.host}`,
        `DB: ${DB_NAME}`
      )
    );
  } catch (err) {
    console.error(chalk.redBright("Error connecting to the database:", err));
    process.exit(1);
  }
}

connectToDB()
  .then(() => {
    // server is created...
    app.listen(Number(PORT) || 4000, "0.0.0.0", (err?: Error) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(chalk.yellow.underline.bold(`Server listening on port ${PORT}`));
    });
  })
  .catch((err) => {

    process.exit(1);
  });
