import { NONE_ID } from "./constants";
import type { RoleDocument } from "./discover";
import { resolveDocumentId, type IdentityOutcome } from "./resolve";

export function roleChoiceIds(documents: Map<string, RoleDocument>): string[] {
	return [...documents.keys()].sort().concat(NONE_ID);
}

export function completeRoleChoices(
	ids: string[],
	prefix: string,
): Array<{ value: string; label: string }> {
	return ids
		.filter((id) => id.startsWith(prefix))
		.map((id) => ({ value: id, label: id }));
}

export function switchSessionRole(
	id: string,
	documents: Map<string, RoleDocument>,
	previous: IdentityOutcome,
): { outcome: IdentityOutcome; error?: string } {
	const outcome = lookupRoleId(id, documents);
	if (outcome === undefined) {
		return {
			outcome: previous,
			error: `Unknown identity "${id.trim()}".`,
		};
	}
	return { outcome };
}

export function restoreSessionRole(
	id: string,
	documents: Map<string, RoleDocument>,
): { outcome: IdentityOutcome } | { error: string } {
	const outcome = lookupRoleId(id, documents);
	if (outcome === undefined) {
		return { error: `Unknown identity "${id.trim()}".` };
	}
	return { outcome };
}

function lookupRoleId(
	id: string,
	documents: Map<string, RoleDocument>,
): IdentityOutcome | undefined {
	return resolveDocumentId(id.trim(), documents);
}
