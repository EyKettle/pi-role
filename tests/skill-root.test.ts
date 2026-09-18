import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { bundledSkillRoot } from "../skill-root";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

describe("bundledSkillRoot", () => {
	it("resolves the package skills directory from the factory module URL", () => {
		const factoryUrl = new URL("../index.ts", import.meta.url).href;
		const root = bundledSkillRoot(factoryUrl);
		expect(root).toBe(join(packageRoot, "skills"));
		expect(existsSync(join(root, "identity", "SKILL.md"))).toBe(true);
	});
});
