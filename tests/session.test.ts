import { afterAll, describe, expect, it, vi } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const agentDir = mkdtempSync(join(tmpdir(), "role-session-"));
mkdirSync(join(agentDir, "roles"), { recursive: true });
writeFileSync(join(agentDir, "roles", "Worker.md"), "I am a worker.");

vi.mock("../deps/pi-coding-agent", () => ({
	CONFIG_DIR_NAME: ".pi",
	getAgentDir: () => agentDir,
}));

const { default: factory } = await import("../index");
const { getBoundIdentity, setBoundIdentity } = await import("../bind");
const { IDENTITY_ENTRY_TYPE } = await import("../persist");
import type { ExtensionAPI } from "../deps/pi-coding-agent";

afterAll(() => {
	rmSync(agentDir, { recursive: true, force: true });
	setBoundIdentity({ kind: "none" });
});

type EventHandler = (...args: unknown[]) => void;

function startExtension(): {
	start: EventHandler;
	turn: EventHandler;
	role: (args: string) => Promise<void>;
	appended: Array<{ type: string; data: unknown }>;
	statuses: Array<{ key: string; text: string | undefined }>;
	selected: string[] | undefined;
} {
	const handlers = new Map<string, EventHandler>();
	let roleHandler: (args: string, ctx: unknown) => Promise<void> = async () => {};
	const appended: Array<{ type: string; data: unknown }> = [];
	const statuses: Array<{ key: string; text: string | undefined }> = [];
	let selected: string[] | undefined;
	const ui = {
		setStatus(key: string, text: string | undefined) {
			statuses.push({ key, text });
		},
		async select(_title: string, options: string[]) {
			selected = options;
			return options[0];
		},
		notify() {},
	};
	factory({
		on(event: string, handler: EventHandler) {
			handlers.set(event, handler);
		},
		registerFlag() {},
		registerCommand(
			_name: string,
			spec: { handler: (args: string, ctx: unknown) => Promise<void> },
		) {
			roleHandler = spec.handler;
		},
		getFlag() {
			return undefined;
		},
		appendEntry(type: string, data?: unknown) {
			appended.push({ type, data });
		},
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
		turn: () => handlers.get("turn_start")?.(),
		role: (args: string) => roleHandler(args, ctx),
		appended,
		statuses,
		get selected() {
			return selected;
		},
	};
}

describe("session identity persistence", () => {
	it("restores the stored id on startup and does not append", () => {
		const { start, appended, statuses } = startExtension();
		start(
			{ type: "session_start", reason: "startup" },
			{
				cwd: agentDir,
				isProjectTrusted: () => false,
				hasUI: false,
				ui: {
					setStatus(key: string, text: string | undefined) {
						statuses.push({ key, text });
					},
					notify() {},
				},
				sessionManager: {
					getEntries: () => [
						{
							type: "custom",
							customType: IDENTITY_ENTRY_TYPE,
							data: { id: "Worker" },
						},
					],
				},
			},
		);
		expect(getBoundIdentity()).toEqual({
			kind: "document",
			id: "Worker",
			body: "I am a worker.",
			path: join(agentDir, "roles", "Worker.md"),
		});
		expect(appended).toEqual([]);
		expect(statuses).toEqual([{ key: "role", text: "Worker" }]);
	});

	it("does not append on /role; appends on turn_start", async () => {
		const { role, turn, appended } = startExtension();
		setBoundIdentity({ kind: "none" });
		await role("Worker");
		expect(getBoundIdentity()).toMatchObject({ kind: "document", id: "Worker" });
		expect(appended).toEqual([]);
		turn();
		expect(appended).toEqual([
			{ type: IDENTITY_ENTRY_TYPE, data: { id: "Worker" } },
		]);
	});

	it("sets the footer status to the identity id without a prefix", async () => {
		const { role, statuses } = startExtension();
		setBoundIdentity({ kind: "none" });
		await role("Worker");
		expect(statuses).toEqual([{ key: "role", text: "Worker" }]);
		await role("none");
		expect(statuses).toEqual([
			{ key: "role", text: "Worker" },
			{ key: "role", text: "none" },
		]);
	});

	it("does not update the footer status when the switch fails", async () => {
		const { role, statuses } = startExtension();
		setBoundIdentity({ kind: "none" });
		await role("Missing");
		expect(statuses).toEqual([]);
	});

	it("offers raw identity ids in the selector", async () => {
		const session = startExtension();
		await session.role("");
		expect(session.selected).toEqual(["Worker", "none"]);
	});
});
