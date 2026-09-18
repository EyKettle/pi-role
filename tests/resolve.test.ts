import { describe, expect, it } from "vitest";
import { resolveIdentity } from "../resolve";
import type { RoleDocument } from "../discover";

function docs(...ids: string[]): Map<string, RoleDocument> {
	const map = new Map<string, RoleDocument>();
	for (const id of ids) {
		map.set(id, { id, body: `${id} body`, path: `/roles/${id}.md` });
	}
	return map;
}

describe("resolveIdentity", () => {
	it("lets the flag win over env and settings", () => {
		const result = resolveIdentity({
			flag: "Reviewer",
			env: "Other",
			defaultId: "Other",
			fallbackId: "none",
			documents: docs("Reviewer", "Other"),
		});
		expect(result).toEqual({
			kind: "document",
			id: "Reviewer",
			body: "Reviewer body",
			path: "/roles/Reviewer.md",
		});
	});

	it("lets env win over settings when the flag is absent", () => {
		const result = resolveIdentity({
			flag: undefined,
			env: "Reviewer",
			defaultId: "Other",
			fallbackId: "none",
			documents: docs("Reviewer", "Other"),
		});
		expect(result.kind).toBe("document");
		if (result.kind === "document") {
			expect(result.id).toBe("Reviewer");
		}
	});

	it("skips an empty default and uses fallback", () => {
		const result = resolveIdentity({
			flag: undefined,
			env: undefined,
			defaultId: "",
			fallbackId: "Reviewer",
			documents: docs("Reviewer"),
		});
		expect(result.kind).toBe("document");
		if (result.kind === "document") {
			expect(result.id).toBe("Reviewer");
		}
	});

	it("continues past a missing file then none with notify", () => {
		const result = resolveIdentity({
			flag: "Missing",
			env: undefined,
			defaultId: "AlsoMissing",
			fallbackId: "Gone",
			documents: docs("Reviewer"),
		});
		expect(result.kind).toBe("none");
		if (result.kind === "none") {
			expect(result.notify).toBeDefined();
		}
	});

	it("selects explicit none as absence without invalidity notify", () => {
		const result = resolveIdentity({
			flag: "none",
			env: "Reviewer",
			defaultId: "Reviewer",
			fallbackId: "Reviewer",
			documents: docs("Reviewer"),
		});
		expect(result).toEqual({ kind: "none" });
	});

	it("treats empty flag and env as invalid hops", () => {
		const result = resolveIdentity({
			flag: "",
			env: "",
			defaultId: "Reviewer",
			fallbackId: "none",
			documents: docs("Reviewer"),
		});
		expect(result.kind).toBe("document");
		if (result.kind === "document") {
			expect(result.id).toBe("Reviewer");
		}
	});
});
