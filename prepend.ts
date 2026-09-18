import type { IdentityOutcome } from "./resolve";

export function prependIdentity(body: string, base: string): string {
	return `<identity>\n${body}\n</identity>\n${base}`;
}

export function chainedSystemPrompt(
	bound: IdentityOutcome,
	base: string,
): string | undefined {
	if (bound.kind !== "document") {
		return undefined;
	}
	return prependIdentity(bound.body, base);
}
