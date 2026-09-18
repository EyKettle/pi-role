import { afterAll, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bindSessionIdentity } from "../bind";
import { chainedSystemPrompt } from "../prepend";

const tmpDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), "role-bind-"));
	tmpDirs.push(dir);
	return dir;
}

afterAll(() => {
	for (const dir of tmpDirs) {
		rmSync(dir, { recursive: true, force: true });
	}
});

describe("bindSessionIdentity", () => {
	it("binds the flag document from the user roles tree", () => {
		const agentDir = makeTempDir();
		const cwd = makeTempDir();
		mkdirSync(join(agentDir, "roles"), { recursive: true });
		writeFileSync(join(agentDir, "roles", "Reviewer.md"), "I am a reviewer.");
		const { outcome } = bindSessionIdentity({
			flag: "Reviewer",
			env: undefined,
			agentDir,
			cwd,
			configDirName: ".pi",
			projectTrusted: false,
		});
		expect(outcome).toEqual({
			kind: "document",
			id: "Reviewer",
			body: "I am a reviewer.",
			path: join(agentDir, "roles", "Reviewer.md"),
		});
	});

	it("does not use an untrusted project roles file", () => {
		const agentDir = makeTempDir();
		const cwd = makeTempDir();
		mkdirSync(join(agentDir, "roles"), { recursive: true });
		mkdirSync(join(cwd, ".pi", "roles"), { recursive: true });
		writeFileSync(join(agentDir, "roles", "Reviewer.md"), "user");
		writeFileSync(join(cwd, ".pi", "roles", "Reviewer.md"), "project");
		const { outcome } = bindSessionIdentity({
			flag: "Reviewer",
			env: undefined,
			agentDir,
			cwd,
			configDirName: ".pi",
			projectTrusted: false,
		});
		expect(outcome.kind).toBe("document");
		if (outcome.kind === "document") {
			expect(outcome.body).toBe("user");
		}
	});
});

describe("chainedSystemPrompt", () => {
	it("returns undefined for none so the prompt is unchanged", () => {
		expect(chainedSystemPrompt({ kind: "none" }, "BASE")).toBeUndefined();
	});

	it("prepends a bound document body", () => {
		expect(
			chainedSystemPrompt(
				{
					kind: "document",
					id: "Reviewer",
					body: "BODY",
					path: "/roles/Reviewer.md",
				},
				"BASE",
			),
		).toBe("<identity>\nBODY\n</identity>\nBASE");
	});
});
