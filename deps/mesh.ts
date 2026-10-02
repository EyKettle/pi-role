/**
 * pi-mesh accessor — the adapter boundary for this extension.
 *
 * pi-mesh is an OPTIONAL integration: this extension works with or without it,
 * so this module does not import the package. It reads the two facts pi-mesh
 * publishes on stable channels:
 *
 * - The live MeshAPI on `globalThis["__piMesh"]` (pi-mesh's MESH_GLOBAL_KEY; set
 *   by its initMeshAPI, read by its tryGetMeshAPI). pi-mesh stores it on
 *   globalThis precisely so consumers survive module-identity mismatch.
 * - The readiness event name "mesh:ready" (pi-mesh's MESH_READY_EVENT).
 *
 * With pi-mesh absent, tryGetMeshAPI() returns undefined and no "mesh:ready"
 * fires, so every syncMeshRole call is a no-op. If pi-mesh renames either fact,
 * this integration degrades silently.
 */

const MESH_GLOBAL_KEY = "__piMesh";

export const MESH_READY_EVENT = "mesh:ready";

export interface MeshProfileAPI {
	setProfile(profile: { role?: string; description?: string }): void;
}

export function tryGetMeshAPI(): MeshProfileAPI | undefined {
	return (globalThis as Record<string, unknown>)[MESH_GLOBAL_KEY] as
		| MeshProfileAPI
		| undefined;
}
