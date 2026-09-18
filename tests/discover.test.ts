import { afterAll, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { discoverRoleDocuments, roleDirectories } from "../discover";

const tmpDirs: string[] = [];

function makeTempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), "role-discover-"));
	tmpDirs.push(dir);
	return dir;
}

afterAll(() => {
	for (const dir of tmpDirs) {
		rmSync(dir, { recursive: true, force: true });
	}
});

describe("roleDirectories", () => {
	it("omits the project tree when the project is untrusted", () => {
		const dirs = roleDirectories({
			agentDir: "/agent",
			cwd: "/proj",
			configDirName: ".pi",
			projectTrusted: false,
		});
		expect(dirs.userDir).toBe(join("/agent", "roles"));
		expect(dirs.projectDir).toBeUndefined();
	});

	it("includes the project tree when the project is trusted", () => {
		const dirs = roleDirectories({
			agentDir: "/agent",
			cwd: "/proj",
			configDirName: ".pi",
			projectTrusted: true,
		});
		expect(dirs.userDir).toBe(join("/agent", "roles"));
		expect(dirs.projectDir).toBe(join("/proj", ".pi", "roles"));
	});
});

describe("discoverRoleDocuments", () => {
	it("lists markdown files by filename without extension and skips none", () => {
		const userDir = join(makeTempDir(), "roles");
		mkdirSync(userDir, { recursive: true });
		writeFileSync(join(userDir, "Reviewer.md"), "user reviewer");
		writeFileSync(join(userDir, "none.md"), "must not be an id");
		writeFileSync(join(userDir, "notes.txt"), "ignored");

		const docs = discoverRoleDocuments({ userDir, projectDir: undefined });
		expect([...docs.keys()]).toEqual(["Reviewer"]);
		expect(docs.get("Reviewer")).toEqual({
			id: "Reviewer",
			body: "user reviewer",
			path: join(userDir, "Reviewer.md"),
		});
	});

	it("lets a trusted project file win the same id", () => {
		const userDir = join(makeTempDir(), "user-roles");
		const projectDir = join(makeTempDir(), "project-roles");
		mkdirSync(userDir, { recursive: true });
		mkdirSync(projectDir, { recursive: true });
		writeFileSync(join(userDir, "Reviewer.md"), "user body");
		writeFileSync(join(projectDir, "Reviewer.md"), "project body");

		const docs = discoverRoleDocuments({ userDir, projectDir });
		expect(docs.size).toBe(1);
		expect(docs.get("Reviewer")?.body).toBe("project body");
		expect(docs.get("Reviewer")?.path).toBe(join(projectDir, "Reviewer.md"));
	});

	it("does not list unreadable or missing trees", () => {
		const docs = discoverRoleDocuments({
			userDir: join(makeTempDir(), "missing"),
			projectDir: undefined,
		});
		expect(docs.size).toBe(0);
	});
});
