import { describe, expect, it } from "vitest";
import {
	completeRoleChoices,
	roleChoiceIds,
	switchSessionRole,
} from "../command";
import type { RoleDocument } from "../discover";
import type { IdentityOutcome } from "../resolve";
import { NONE_ID } from "../constants";
import factory from "../index";
import type { ExtensionAPI } from "../deps/pi-coding-agent";

function docs(...ids: string[]): Map<string, RoleDocument> {
	const map = new Map<string, RoleDocument>();
	for (const id of ids) {
		map.set(id, { id, body: `${id} body`, path: `/roles/${id}.md` });
	}
	return map;
}

const previous: IdentityOutcome = {
	kind: "document",
	id: "Reviewer",
	body: "Reviewer body",
	path: "/roles/Reviewer.md",
};

describe("roleChoiceIds", () => {
	it("lists discovered ids then none", () => {
		expect(roleChoiceIds(docs("B", "A"))).toEqual(["A", "B", NONE_ID]);
	});
});

describe("completeRoleChoices", () => {
	it("filters by prefix", () => {
		expect(completeRoleChoices(["Reviewer", "none"], "Re")).toEqual([
			{ value: "Reviewer", label: "Reviewer" },
		]);
	});
});

describe("switchSessionRole", () => {
	it("binds a discovered id", () => {
		expect(switchSessionRole("Reviewer", docs("Reviewer"), { kind: "none" })).toEqual({
			outcome: {
				kind: "document",
				id: "Reviewer",
				body: "Reviewer body",
				path: "/roles/Reviewer.md",
			},
		});
	});

	it("binds none as legal absence", () => {
		expect(switchSessionRole("none", docs("Reviewer"), previous)).toEqual({
			outcome: { kind: "none" },
		});
	});

	it("keeps the previous identity on an unknown id", () => {
		expect(switchSessionRole("Missing", docs("Reviewer"), previous)).toEqual({
			outcome: previous,
			error: 'Unknown identity "Missing".',
		});
	});
});

describe("extension factory", () => {
	it("registers the role command", () => {
		const names: string[] = [];
		factory({
			on() {},
			registerFlag() {},
			registerCommand(name: string) {
				names.push(name);
			},
			getFlag() {
				return undefined;
			},
		} as unknown as ExtensionAPI);
		expect(names).toContain("role");
	});
});
