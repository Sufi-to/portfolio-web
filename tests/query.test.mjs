import assert from "node:assert/strict";
import { test } from "node:test";
import { hasToken, matches, parseQuery, toggleToken, toSql } from "../src/lib/query.ts";
import { projects } from "../src/content/projects.ts";

test("parseQuery separates filters, free words and unknown keys", () => {
  const q = parseQuery("domain:ai status:shipped databricks colour:red");
  assert.deepEqual(q.filters.domain, ["ai"]);
  assert.deepEqual(q.filters.status, ["shipped"]);
  assert.deepEqual(q.words, ["databricks"]);
  assert.deepEqual(q.unknown, ["colour:red"]);
});

test("values of one key are OR-ed, different keys are AND-ed", () => {
  const either = projects.filter((p) => matches(p, parseQuery("domain:systems domain:data")));
  assert.ok(either.some((p) => p.domains.includes("systems")));
  assert.ok(either.some((p) => p.domains.includes("data")));
  const both = projects.filter((p) => matches(p, parseQuery("domain:ai status:shipped")));
  assert.ok(both.length > 0);
  assert.ok(both.every((p) => p.domains.includes("ai") && p.status === "shipped"));
});

test("toggleToken adds and removes a token and keeps the rest", () => {
  const on = toggleToken("databricks", "domain", "ai");
  assert.equal(on, "databricks domain:ai");
  assert.ok(hasToken(parseQuery(on), "domain", "ai"));
  assert.equal(toggleToken(on, "domain", "ai"), "databricks");
});

test("toSql escapes quotes in free text", () => {
  assert.match(toSql(parseQuery("o'reilly")), /'%o''reilly%'/);
});

test("an empty query lists everything", () => {
  assert.equal(projects.filter((p) => matches(p, parseQuery(""))).length, projects.length);
  assert.doesNotMatch(toSql(parseQuery("")), /WHERE/);
});
