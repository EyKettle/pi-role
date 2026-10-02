import { afterAll, describe, expect, it, vi } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const agentDir = mkdtempSync(join(tmpdir(), "role-mesh-wiring-"));
mkdirSync(join(agentDir, "roles"), { recursive: true });
writeFileSync(join(agentDir, "roles", "Worker.md"), "I am a worker.");

const holder = vi.hoisted(() => ({
	calls: [] as Array<{ role?: string; description?: string }>,
}));

vi.mock("../deps/mesh", () => ({
	MESH_READY_EVENT: "mesh:ready",
	tryGetMeshAPI: () => ({
		setProfile: (profile: { role?: string; description?: string }) => {
			holder.calls.push(profile);
		},
	}),
}));

vi.mock("../deps/pi-coding-agent", () => ({
	CONFIG_DIR_NAME: ".pi",
	getAgentDir: () => agentDir,
}));

const { default: factory } = await import("../index");
const { setBoundIdentity } = await import("../bind");
import type { ExtensionAPI } from "../deps/pi-coding-agent";

afterAll(() => {
	rmSync(agentDir, { recursive: true, force: true });
});

type EventHandler = (...args: unknown[]) => void;

function startExtension(): {
	start: EventHandler;
	role: (args: string) => Promise<void>;
	meshReady: () => void;
} {
	const handlers = new Map<string, EventHandler>();
	const meshHandlers = new Map<string, () => void>();
	let roleHandler: (args: string, ctx: unknown) => Promise<void> = async () => {};
	const ui = {
		setStatus() {},
		async select(_title: string, options: string[]) {
			return options[0];
		},
		notify() {},
	};
	factory({
		on(event: string, handler: EventHandler) {
			handlers.set(event, handler);
		},
		events: {
			on(channel: string, handler: () => void) {
				meshHandlers.set(channel, handler);
				return () => {};
			},
		},
		registerFlag() {},
		registerCommand(
			_name: string,
			spec: { handler: (args: string, ctx: unknown) => Promise<void> },
		) {
			roleHandler = spec.handler;
		},
		getFlag() {
			return "Worker";
		},
		appendEntry() {},
	} as unknown as ExtensionAPI);
	const ctx = {
		cwd: agentDir,
		isProjectTrusted: () => false,
		hasUI: false,
		ui,
		sessionManager: { getEntries: () => [] as unknown[] },
	};
	return {
		start: (event, sessionCtx) => handlers.get("session_start")?.(event, sessionCtx),
		role: (args: string) => roleHandler(args, ctx),
		meshReady: () => meshHandlers.get("mesh:ready")?.(),
	};
}

describe("mesh role wiring", () => {
	it("writes the bound document id on session_start", () => {
		holder.calls.length = 0;
		const { start } = startExtension();
		start({ type: "session_start", reason: "startup" }, {
			cwd: agentDir,
			isProjectTrusted: () => false,
			hasUI: false,
			ui: { setStatus() {}, notify() {} },
			sessionManager: { getEntries: () => [] as unknown[] },
		});
		expect(holder.calls).toEqual([{ role: "Worker" }]);
	});

	it("clears the role when switching to none", async () => {
		holder.calls.length = 0;
		const { role } = startExtension();
		await role("none");
		expect(holder.calls).toEqual([{ role: "" }]);
	});

	it("rewrites the role on mesh:ready using the currently bound identity", () => {
		holder.calls.length = 0;
		const { meshReady } = startExtension();
		setBoundIdentity({
			kind: "document",
			id: "Worker",
			body: "I am a worker.",
			path: join(agentDir, "roles", "Worker.md"),
		});
		meshReady();
		expect(holder.calls).toEqual([{ role: "Worker" }]);
	});
});
