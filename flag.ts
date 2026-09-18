import type { ExtensionAPI } from "./deps/pi-coding-agent";

export const ROLE_FLAG = "role";

export function registerRoleFlag(pi: Pick<ExtensionAPI, "registerFlag">): void {
	pi.registerFlag(ROLE_FLAG, {
		type: "string",
		description: "Identity document id, or none",
	});
}
