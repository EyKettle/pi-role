import { describe, expect, it } from "vitest";
import { prependIdentity } from "../prepend";

describe("prependIdentity", () => {
	it("wraps the identity body in identity tags before the base prompt", () => {
		expect(prependIdentity("BODY", "BASE")).toBe("<identity>\nBODY\n</identity>\nBASE");
	});
});
