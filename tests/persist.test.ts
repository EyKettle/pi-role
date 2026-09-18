import { describe, expect, it } from "vitest";
import {
	IDENTITY_ENTRY_TYPE,
	identityIdFromEntries,
	storedIdentityId,
	resolveSessionStart,
} from "../persist";
import { NONE_ID } from "../constants";

describe("identityIdFromEntries", () => {
	it("returns the last role-identity id", () => {
		expect(
			identityIdFromEntries([
				{ type: "custom", customType: IDENTITY_ENTRY_TYPE, data: { id: "Orchestrator" } },
				{ type: "message" },
				{ type: "custom", customType: IDENTITY_ENTRY_TYPE, data: { id: "Worker" } },
			]),
		).toBe("Worker");
	});

	it("returns none when that id was stored", () => {
		expect(
			identityIdFromEntries([
				{ type: "custom", customType: IDENTITY_ENTRY_TYPE, data: { id: NONE_ID } },
			]),
		).toBe(NONE_ID);
	});

	it("returns undefined when no identity entry exists", () => {
		expect(identityIdFromEntries([{ type: "message" }])).toBeUndefined();
	});
});

describe("storedIdentityId", () => {
	it("stores none and document ids", () => {
		expect(storedIdentityId({ kind: "none" })).toBe(NONE_ID);
		expect(
			storedIdentityId({
				kind: "document",
				id: "Worker",
				body: "body",
				path: "/roles/Worker.md",
			}),
		).toBe("Worker");
	});
});

describe("resolveSessionStart", () => {
	const worker = {
		kind: "document" as const,
		id: "Worker",
		body: "b",
		path: "/w",
	};
	const bind = () => ({ outcome: { kind: "none" as const } });
	const restore = (id: string) =>
		id === "Worker"
			? { outcome: worker }
			: { error: `Unknown identity "${id}".` };

	it("restores the stored id regardless of session reason", () => {
		expect(
			resolveSessionStart({
				entries: [
					{
						type: "custom",
						customType: IDENTITY_ENTRY_TYPE,
						data: { id: "Worker" },
					},
				],
				restore,
				bind,
			}),
		).toEqual({ outcome: worker });
	});

	it("binds when no identity entry exists", () => {
		expect(
			resolveSessionStart({
				entries: [{ type: "message" }],
				restore,
				bind,
			}),
		).toEqual({ outcome: { kind: "none" } });
	});

	it("falls through to bind when stored id is unknown", () => {
		expect(
			resolveSessionStart({
				entries: [
					{
						type: "custom",
						customType: IDENTITY_ENTRY_TYPE,
						data: { id: "Missing" },
					},
				],
				restore,
				bind,
			}),
		).toEqual({
			outcome: { kind: "none" },
			restoreError: 'Unknown identity "Missing".',
		});
	});

	it("uses the flag hop and skips stored identity", () => {
		const flagBind = () => ({
			outcome: {
				kind: "document" as const,
				id: "Reviewer",
				body: "r",
				path: "/r",
			},
		});
		expect(
			resolveSessionStart({
				flag: "Reviewer",
				entries: [
					{
						type: "custom",
						customType: IDENTITY_ENTRY_TYPE,
						data: { id: "Worker" },
					},
				],
				restore,
				bind: flagBind,
			}),
		).toEqual({
			outcome: {
				kind: "document",
				id: "Reviewer",
				body: "r",
				path: "/r",
			},
		});
	});
});
