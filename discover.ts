import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { NONE_ID } from "./constants";

export interface RoleDocument {
	id: string;
	body: string;
	path: string;
}

export function roleDirectories(input: {
	agentDir: string;
	cwd: string;
	configDirName: string;
	projectTrusted: boolean;
}): { userDir: string; projectDir: string | undefined } {
	return {
		userDir: join(input.agentDir, "roles"),
		projectDir: input.projectTrusted
			? join(input.cwd, input.configDirName, "roles")
			: undefined,
	};
}

export function discoverRoleDocuments(input: {
	userDir: string;
	projectDir: string | undefined;
}): Map<string, RoleDocument> {
	const docs = new Map<string, RoleDocument>();
	loadTree(input.userDir, docs);
	if (input.projectDir !== undefined) {
		loadTree(input.projectDir, docs);
	}
	return docs;
}

function loadTree(dir: string, docs: Map<string, RoleDocument>): void {
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return;
	}
	for (const name of entries) {
		if (!name.endsWith(".md")) {
			continue;
		}
		const id = name.slice(0, -".md".length);
		if (id.length === 0 || id === NONE_ID) {
			continue;
		}
		const path = join(dir, name);
		let body: string;
		try {
			if (!statSync(path).isFile()) {
				continue;
			}
			body = readFileSync(path, "utf8");
		} catch {
			continue;
		}
		docs.set(id, { id, body, path });
	}
}
