import { discoverRoleDocuments, roleDirectories } from "./discover";
import { loadRoleSettings } from "./settings";
import { resolveIdentity, type IdentityOutcome } from "./resolve";

export function bindSessionIdentity(input: {
	flag: string | undefined;
	env: string | undefined;
	agentDir: string;
	cwd: string;
	configDirName: string;
	projectTrusted: boolean;
}): { outcome: IdentityOutcome; settingsError?: string } {
	const dirs = roleDirectories({
		agentDir: input.agentDir,
		cwd: input.cwd,
		configDirName: input.configDirName,
		projectTrusted: input.projectTrusted,
	});
	const documents = discoverRoleDocuments(dirs);
	const loaded = loadRoleSettings({
		agentDir: input.agentDir,
		cwd: input.cwd,
		configDirName: input.configDirName,
		projectTrusted: input.projectTrusted,
	});
	return {
		outcome: resolveIdentity({
			flag: input.flag,
			env: input.env,
			defaultId: loaded.settings.defaultId,
			fallbackId: loaded.settings.fallbackId,
			documents,
		}),
		settingsError: loaded.error,
	};
}

let bound: IdentityOutcome = { kind: "none" };

export function getBoundIdentity(): IdentityOutcome {
	return bound;
}

export function setBoundIdentity(outcome: IdentityOutcome): void {
	bound = outcome;
}
