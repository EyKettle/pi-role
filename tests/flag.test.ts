import { describe, expect, it } from "vitest";
import { ROLE_FLAG, registerRoleFlag } from "../flag";
import factory from "../index";
import type { ExtensionAPI } from "../deps/pi-coding-agent";

describe("registerRoleFlag", () => {
	it("registers a string flag named role", () => {
		const registered: Array<{ name: string; options: unknown }> = [];
		registerRoleFlag({
			registerFlag(name, options) {
				registered.push({ name, options });
			},
		});
		expect(registered).toEqual([
			{
				name: ROLE_FLAG,
				options: {
					type: "string",
					description: "Identity document id, or none",
				},
			},
		]);
	});
});

describe("extension factory", () => {
	it("registers the role flag at factory time", () => {
		const names: string[] = [];
		factory({
			on() {},
			registerFlag(name: string) {
				names.push(name);
			},
			getFlag() {
				return undefined;
			},
		} as unknown as ExtensionAPI);
		expect(names).toContain(ROLE_FLAG);
	});
});
