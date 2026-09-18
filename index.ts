import { bundledSkillRoot } from "./skill-root";
import {
	CONFIG_DIR_NAME,
	getAgentDir,
	type ExtensionAPI,
} from "./deps/pi-coding-agent";
import { registerRoleFlag, ROLE_FLAG, roleFlagValue } from "./flag";
import { ROLE_ENV } from "./constants";
import {
	bindSessionIdentity,
	getBoundIdentity,
	setBoundIdentity,
} from "./bind";
import { chainedSystemPrompt } from "./prepend";

export default function (pi: ExtensionAPI): void {
	registerRoleFlag(pi);
	pi.on("resources_discover", () => ({
		skillPaths: [bundledSkillRoot(import.meta.url)],
	}));
	pi.on("session_start", (_event, ctx) => {
		const { outcome, settingsError } = bindSessionIdentity({
			flag: roleFlagValue(pi.getFlag(ROLE_FLAG)),
			env: process.env[ROLE_ENV],
			agentDir: getAgentDir(),
			cwd: ctx.cwd,
			configDirName: CONFIG_DIR_NAME,
			projectTrusted: ctx.isProjectTrusted(),
		});
		setBoundIdentity(outcome);
		if (!ctx.hasUI) {
			return;
		}
		if (settingsError !== undefined) {
			ctx.ui.notify(settingsError, "warning");
		}
		if (outcome.kind === "none" && outcome.notify !== undefined) {
			ctx.ui.notify(outcome.notify, "warning");
		}
	});
	pi.on("before_agent_start", (event) => {
		const systemPrompt = chainedSystemPrompt(
			getBoundIdentity(),
			event.systemPrompt,
		);
		if (systemPrompt === undefined) {
			return;
		}
		return { systemPrompt };
	});
}
