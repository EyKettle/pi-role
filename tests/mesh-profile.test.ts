import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const holder = vi.hoisted(() => ({
	api: undefined as
		| { setProfile: (profile: { role?: string; description?: string }) => void }
		| undefined,
	calls: [] as Array<{ role?: string; description?: string }>,
}));

vi.mock("../deps/mesh", () => ({
	MESH_READY_EVENT: "mesh:ready",
	tryGetMeshAPI: () => holder.api,
}));

const { meshRoleFor, publishMeshRole, syncMeshRole, backfillMeshRoleOnReady } =
	await import("../mesh-profile");
import type { IdentityOutcome } from "../resolve";

function recordProfile(profile: { role?: string; description?: string }): void {
	holder.calls.push(profile);
}

beforeEach(() => {
	holder.calls.length = 0;
	holder.api = { setProfile: recordProfile };
});

afterEach(() => {
	holder.api = undefined;
});

describe("meshRoleFor", () => {
	it("uses the document id for a document identity", () => {
		expect(
			meshRoleFor({
				kind: "document",
				id: "Worker",
				body: "I am a worker.",
				path: "/roles/Worker.md",
			}),
		).toBe("Worker");
	});

	it("uses an empty role for none", () => {
		expect(meshRoleFor({ kind: "none" })).toBe("");
	});
});

describe("syncMeshRole", () => {
	it("writes the document id into role", () => {
		syncMeshRole({
			kind: "document",
			id: "Reviewer",
			body: "BODY",
			path: "/roles/Reviewer.md",
		});
		expect(holder.calls).toEqual([{ role: "Reviewer" }]);
	});

	it("clears role for none", () => {
		syncMeshRole({ kind: "none" });
		expect(holder.calls).toEqual([{ role: "" }]);
	});

	it("never writes a description", () => {
		syncMeshRole({
			kind: "document",
			id: "Worker",
			body: "BODY",
			path: "/roles/Worker.md",
		});
		expect(Object.keys(holder.calls[0])).toEqual(["role"]);
	});

	it("succeeds without failing when the mesh API is not ready", () => {
		holder.api = undefined;
		expect(() => syncMeshRole({ kind: "document", id: "Worker", body: "", path: "" })).not.toThrow();
		expect(holder.calls).toEqual([]);
	});
});

describe("publishMeshRole", () => {
	it("does nothing when the API is undefined", () => {
		publishMeshRole({ kind: "none" }, undefined);
		expect(holder.calls).toEqual([]);
	});
});

describe("backfillMeshRoleOnReady", () => {
	it("rewrites the currently bound identity when mesh:ready fires", () => {
		let bound: IdentityOutcome = {
			kind: "document",
			id: "Worker",
			body: "BODY",
			path: "/roles/Worker.md",
		};
		const handlers = new Map<string, (data: unknown) => void>();
		backfillMeshRoleOnReady(
			{
				on(channel, handler) {
					handlers.set(channel, handler);
					return () => handlers.delete(channel);
				},
			},
			() => bound,
		);
		expect(handlers.has("mesh:ready")).toBe(true);

		bound = { kind: "none" };
		handlers.get("mesh:ready")?.({});
		expect(holder.calls).toEqual([{ role: "" }]);
	});
});
