import { makePage } from "@keystatic/next/ui/app";
import keystaticConfig from "@/keystatic.config";

export default makePage(keystaticConfig);

export const dynamic = "force-dynamic";
