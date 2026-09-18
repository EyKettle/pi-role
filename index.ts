import { bundledSkillRoot } from "./skill-root";
import {
	CONFIG_DIR_NAME,
	getAgentDir,
	type ExtensionAPI,
} from "./deps/pi-coding-agent";
import { registerRoleFlag, ROLE_FLAG, roleFlagValue } from "./flag";
import { NONE_ID, ROLE_ENV } from "./constants";
import {
	bindSessionIdentity,
	discoverBoundDocuments,
	getBoundIdentity,
	lastSessionContext,
	rememberSessionContext,
	setBoundIdentity,
} from "./bind";
import {
	completeRoleChoices,
	roleChoiceIds,
	switchSessionRole,
} from "./command";
import { chainedSystemPrompt } from "./prepend";
import type { RoleDocument } from "./discover";

export default function (pi: ExtensionAPI): void {
	registerRoleFlag(pi);
	pi.registerCommand("role", {
		description: "Switch session identity (does not write settings)",
		getArgumentCompletions: (prefix: string) => {
			const items = completeRoleChoices(
				roleChoiceIds(documentsFor(lastSessionContext())),
				prefix,
			);
			return items.length > 0 ? items : null;
		},
		handler: async (args, ctx) => {
			const documents = documentsFor({
				cwd: ctx.cwd,
				projectTrusted: ctx.isProjectTrusted(),
			});
			const trimmed = args.trim();
			const id =
				trimmed.length > 0
					? trimmed
					: await ctx.ui.select("Identity", roleChoiceIds(documents));
			if (id === undefined) {
				return;
			}
			const { outcome, error } = switchSessionRole(
				id,
				documents,
				getBoundIdentity(),
			);
			if (error !== undefined) {
				if (ctx.hasUI) {
					ctx.ui.notify(error, "error");
				}
				return;
			}
			setBoundIdentity(outcome);
			if (ctx.hasUI) {
				const label = outcome.kind === "none" ? NONE_ID : outcome.id;
				ctx.ui.notify(`Identity: ${label}`, "info");
			}
		},
	});
	pi.on("resources_discover", () => ({
		skillPaths: [bundledSkillRoot(import.meta.url)],
	}));
	pi.on("session_start", (_event, ctx) => {
		rememberSessionContext(ctx.cwd, ctx.isProjectTrusted());
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

function documentsFor(session: {
	cwd: string;
	projectTrusted: boolean;
}): Map<string, RoleDocument> {
	return discoverBoundDocuments({
		agentDir: getAgentDir(),
		cwd: session.cwd,
		configDirName: CONFIG_DIR_NAME,
		projectTrusted: session.projectTrusted,
	});
}
