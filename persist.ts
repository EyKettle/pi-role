import { NONE_ID } from "./constants";
import type { IdentityOutcome } from "./resolve";

export const IDENTITY_ENTRY_TYPE = "role-identity";

export interface SessionEntryLike {
	type: string;
	customType?: string;
	data?: unknown;
}

export function identityIdFromEntries(
	entries: readonly SessionEntryLike[],
): string | undefined {
	let id: string | undefined;
	for (const entry of entries) {
		if (entry.type !== "custom" || entry.customType !== IDENTITY_ENTRY_TYPE) {
			continue;
		}
		const stored = storedId(entry.data);
		if (stored !== undefined) {
			id = stored;
		}
	}
	return id;
}

export function storedIdentityId(outcome: IdentityOutcome): string {
	return outcome.kind === "none" ? NONE_ID : outcome.id;
}

export function storedIdentityStatus(outcome: IdentityOutcome): string | undefined {
  return outcome.kind === "none" ? undefined : outcome.id;
}

function storedId(data: unknown): string | undefined {
	if (typeof data !== "object" || data === null) {
		return undefined;
	}
	const id = (data as { id?: unknown }).id;
	return typeof id === "string" && id.length > 0 ? id : undefined;
}

export function resolveSessionStart(input: {
	flag?: string;
	entries: readonly SessionEntryLike[];
	restore: (id: string) => { outcome: IdentityOutcome } | { error: string };
	bind: () => { outcome: IdentityOutcome; settingsError?: string };
}): {
	outcome: IdentityOutcome;
	settingsError?: string;
	restoreError?: string;
} {
	if (input.flag !== undefined && input.flag.length > 0) {
		return input.bind();
	}
	const stored = identityIdFromEntries(input.entries);
	if (stored !== undefined) {
		const restored = input.restore(stored);
		if ("outcome" in restored) {
			return { outcome: restored.outcome };
		}
		return { ...input.bind(), restoreError: restored.error };
	}
	return input.bind();
}
