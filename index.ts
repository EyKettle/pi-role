import { bundledSkillRoot } from "./skill-root";
import type { ExtensionAPI } from "./deps/pi-coding-agent";

export default function (pi: ExtensionAPI): void {
	pi.on("resources_discover", () => ({
		skillPaths: [bundledSkillRoot(import.meta.url)],
	}));
}
