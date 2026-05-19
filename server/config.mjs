import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });
console.log(`Loaded env from ${envPath}`);
console.log(`JWT_SECRET ${process.env.JWT_SECRET ? 'present' : 'missing'}`);
console.log(`EMAIL_USER ${process.env.EMAIL_USER ? 'present' : 'missing'}, EMAIL_PASS ${process.env.EMAIL_PASS ? 'present' : 'missing'}`);
