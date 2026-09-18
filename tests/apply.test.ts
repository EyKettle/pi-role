import { describe, expect, it } from "vitest";
import factory from "../index";
import { setBoundIdentity } from "../bind";
import type { ExtensionAPI } from "../deps/pi-coding-agent";

describe("before_agent_start wiring", () => {
	it("prepends a bound document and leaves none unchanged", () => {
		const handlers = new Map<string, (event: { systemPrompt: string }) => unknown>();
		factory({
			on(event: string, handler: (event: { systemPrompt: string }) => unknown) {
				handlers.set(event, handler);
			},
			registerFlag() {},
			getFlag() {
				return undefined;
			},
		} as unknown as ExtensionAPI);
		const start = handlers.get("before_agent_start");
		expect(start).toBeDefined();
		if (start === undefined) {
			return;
		}
		setBoundIdentity({
			kind: "document",
			id: "Reviewer",
			body: "BODY",
			path: "/roles/Reviewer.md",
		});
		expect(start({ systemPrompt: "BASE" })).toEqual({
			systemPrompt: "<identity>\nBODY\n</identity>\nBASE",
		});
		setBoundIdentity({ kind: "none" });
		expect(start({ systemPrompt: "BASE" })).toBeUndefined();
	});
});
