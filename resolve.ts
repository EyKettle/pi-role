import { NONE_ID } from "./constants";
import type { RoleDocument } from "./discover";

export type IdentityOutcome =
	| { kind: "none"; notify?: string }
	| { kind: "document"; id: string; body: string; path: string };

const CHAIN_EXHAUSTED_NOTIFY =
	"No valid identity in the role chain; using none.";

export function resolveIdentity(input: {
	flag: string | undefined;
	env: string | undefined;
	defaultId: string;
	fallbackId: string;
	documents: Map<string, RoleDocument>;
}): IdentityOutcome {
	const hops = [input.flag, input.env, input.defaultId, input.fallbackId];
	for (const hop of hops) {
		const selected = selectHop(hop, input.documents);
		if (selected !== undefined) {
			return selected;
		}
	}
	return { kind: "none", notify: CHAIN_EXHAUSTED_NOTIFY };
}

function selectHop(
	hop: string | undefined,
	documents: Map<string, RoleDocument>,
): IdentityOutcome | undefined {
	if (hop === undefined || hop.length === 0) {
		return undefined;
	}
	if (hop === NONE_ID) {
		return { kind: "none" };
	}
	const document = documents.get(hop);
	if (document === undefined || document.body.trim().length === 0) {
		return undefined;
	}
	return { kind: "document", ...document };
}
