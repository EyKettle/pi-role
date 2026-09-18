import { bundledSkillRoot } from "./skill-root";
import type { ExtensionAPI } from "./deps/pi-coding-agent";
import { registerRoleFlag } from "./flag";

export default function (pi: ExtensionAPI): void {
	registerRoleFlag(pi);
	pi.on("resources_discover", () => ({
		skillPaths: [bundledSkillRoot(import.meta.url)],
	}));
}
