import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function bundledSkillRoot(moduleUrl: string): string {
	return join(dirname(fileURLToPath(moduleUrl)), "skills");
}
