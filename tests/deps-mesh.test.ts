import { afterEach, describe, expect, it } from "vitest";
import { MESH_READY_EVENT, tryGetMeshAPI } from "../deps/mesh";

const MESH_GLOBAL_KEY = "__piMesh";

afterEach(() => {
	delete (globalThis as Record<string, unknown>)[MESH_GLOBAL_KEY];
});

describe("deps/mesh", () => {
	it("exposes the pi-mesh readiness event name", () => {
		expect(MESH_READY_EVENT).toBe("mesh:ready");
	});

	it("returns undefined when pi-mesh has not initialized", () => {
		expect(tryGetMeshAPI()).toBeUndefined();
	});

	it("returns the MeshAPI pi-mesh publishes on globalThis", () => {
		const api = { setProfile() {} };
		(globalThis as Record<string, unknown>)[MESH_GLOBAL_KEY] = api;
		expect(tryGetMeshAPI()).toBe(api);
	});
});
