import { tryGetMeshAPI, MESH_READY_EVENT, type MeshProfileAPI } from "./deps/mesh";
import type { IdentityOutcome } from "./resolve";

export interface MeshEventBus {
	on(channel: string, handler: (data: unknown) => void): () => void;
}

/** The mesh `role` for an identity: the document id, or empty when unbound. */
export function meshRoleFor(outcome: IdentityOutcome): string {
	return outcome.kind === "document" ? outcome.id : "";
}

/** Write the identity into the mesh profile. A missing API is a no-op. */
export function publishMeshRole(
	outcome: IdentityOutcome,
	api: MeshProfileAPI | undefined,
): void {
	if (api === undefined) return;
	api.setProfile({ role: meshRoleFor(outcome) });
}

/** Publish the currently bound identity to the live mesh API, if it exists. */
export function syncMeshRole(outcome: IdentityOutcome): void {
	publishMeshRole(outcome, tryGetMeshAPI());
}

/**
 * Rewrite the mesh profile once pi-mesh announces readiness, using the identity
 * bound at that moment. Covers the load order where an identity switch happens
 * before pi-mesh initializes.
 */
export function backfillMeshRoleOnReady(
	events: MeshEventBus,
	getBound: () => IdentityOutcome,
): void {
	events.on(MESH_READY_EVENT, () => {
		syncMeshRole(getBound());
	});
}
