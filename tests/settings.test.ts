import { describe, expect, it } from "vitest";
import {
	loadRoleSettings,
	mergeRoleSettings,
	roleSettingsFromJson,
} from "../settings";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("roleSettingsFromJson", () => {
	it("treats absent role as empty default and no fallback patch", () => {
		expect(roleSettingsFromJson("{}")).toEqual({ patch: {} });
	});

	it("reads string default and fallback and ignores extra keys", () => {
		const json = JSON.stringify({
			role: { default: "Reviewer", fallback: "none", extra: 1 },
		});
		expect(roleSettingsFromJson(json)).toEqual({
			patch: { defaultId: "Reviewer", fallbackId: "none" },
		});
	});

	it("returns an error and empty patch for malformed JSON", () => {
		const result = roleSettingsFromJson("{");
		expect(result.patch).toEqual({});
		expect(result.error).toBeDefined();
	});
});

describe("mergeRoleSettings", () => {
	it("uses empty default and none fallback when nothing is set", () => {
		expect(mergeRoleSettings({}, {})).toEqual({
			defaultId: "",
			fallbackId: "none",
		});
	});

	it("lets project nested-merge over global", () => {
		expect(
			mergeRoleSettings(
				{ defaultId: "Reviewer" },
				{ fallbackId: "none" },
			),
		).toEqual({ defaultId: "Reviewer", fallbackId: "none" });
	});
});

describe("loadRoleSettings", () => {
	it("reads global and trusted project settings.json files", () => {
		const root = mkdtempSync(join(tmpdir(), "role-settings-"));
		const agentDir = join(root, "agent");
		const cwd = join(root, "proj");
		mkdirSync(agentDir, { recursive: true });
		mkdirSync(join(cwd, ".pi"), { recursive: true });
		writeFileSync(
			join(agentDir, "settings.json"),
			JSON.stringify({ role: { default: "Reviewer" } }),
		);
		writeFileSync(
			join(cwd, ".pi", "settings.json"),
			JSON.stringify({ role: { fallback: "none" } }),
		);
		expect(
			loadRoleSettings({
				agentDir,
				cwd,
				configDirName: ".pi",
				projectTrusted: true,
			}).settings,
		).toEqual({ defaultId: "Reviewer", fallbackId: "none" });
	});
});
