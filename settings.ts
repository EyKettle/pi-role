import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NONE_ID } from "./constants";

export interface RoleSettingsPatch {
	defaultId?: string;
	fallbackId?: string;
}

export interface RoleSettings {
	defaultId: string;
	fallbackId: string;
}

export function roleSettingsFromJson(text: string): {
	patch: RoleSettingsPatch;
	error?: string;
} {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text) as unknown;
	} catch (error) {
		return {
			patch: {},
			error: error instanceof Error ? error.message : String(error),
		};
	}
	return { patch: extractPatch(parsed) };
}

export function mergeRoleSettings(
	globalPatch: RoleSettingsPatch,
	projectPatch: RoleSettingsPatch,
): RoleSettings {
	return {
		defaultId: projectPatch.defaultId ?? globalPatch.defaultId ?? "",
		fallbackId: projectPatch.fallbackId ?? globalPatch.fallbackId ?? NONE_ID,
	};
}

export function loadRoleSettings(input: {
	agentDir: string;
	cwd: string;
	configDirName: string;
	projectTrusted: boolean;
}): { settings: RoleSettings; error?: string } {
	const globalFile = readSettingsFile(join(input.agentDir, "settings.json"));
	const projectFile = input.projectTrusted
		? readSettingsFile(join(input.cwd, input.configDirName, "settings.json"))
		: { patch: {} as RoleSettingsPatch };
	const error = globalFile.error ?? projectFile.error;
	return {
		settings: mergeRoleSettings(globalFile.patch, projectFile.patch),
		error,
	};
}

function extractPatch(parsed: unknown): RoleSettingsPatch {
	if (typeof parsed !== "object" || parsed === null) {
		return {};
	}
	const role = (parsed as { role?: unknown }).role;
	if (typeof role !== "object" || role === null) {
		return {};
	}
	const record = role as Record<string, unknown>;
	const patch: RoleSettingsPatch = {};
	if (typeof record.default === "string") {
		patch.defaultId = record.default;
	}
	if (typeof record.fallback === "string") {
		patch.fallbackId = record.fallback;
	}
	return patch;
}

function readSettingsFile(path: string): {
	patch: RoleSettingsPatch;
	error?: string;
} {
	let text: string;
	try {
		text = readFileSync(path, "utf8");
	} catch {
		return { patch: {} };
	}
	return roleSettingsFromJson(text);
}
