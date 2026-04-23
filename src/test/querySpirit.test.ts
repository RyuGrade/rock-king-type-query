import { describe, expect, it } from "vitest";
import {
  findSpiritByName,
  parseSpiritNames,
  querySpiritsWeakness,
  querySpiritWeakness,
  queryTypeWeakness,
  suggestSpiritNames
} from "../services/querySpirit";
import { typeRelations } from "../data/types";

describe("findSpiritByName", () => {
  it("should find spirit by name", () => {
    const spirit = findSpiritByName("花影羚羊");
    expect(spirit?.id).toBe("w0021");
  });

  it("should find spirit by alias", () => {
    const spirit = findSpiritByName("火花");
    expect(spirit?.id).toBe("w0004");
  });
});

describe("querySpiritWeakness", () => {
  it("should return weakness for dual types with multipliers", () => {
    const result = querySpiritWeakness("花影羚羊");
    expect(result?.spirit.types).toEqual(["幽", "恶"]);
    expect(result?.damageIncreased).toEqual([
      { type: "光", multiplier: 3 },
      { type: "萌", multiplier: 2 }
    ]);
  });

  it("should return null for empty or unknown keyword", () => {
    expect(querySpiritWeakness("")).toBeNull();
    expect(querySpiritWeakness("不存在精灵")).toBeNull();
  });
});

describe("queryTypeWeakness", () => {
  it("should return type weakness", () => {
    const result = queryTypeWeakness("火");
    expect(result?.resistedBy).toEqual(["水", "地"]);
  });
});

describe("suggestSpiritNames", () => {
  it("should return fuzzy matched spirit names", () => {
    const result = suggestSpiritNames("鸭");
    expect(result.some((n) => n.includes("鸭吉吉"))).toBe(true);
  });

  it("should use last segment after delimiter for suggestions", () => {
    const result = suggestSpiritNames("迪莫,鸭");
    expect(result.some((n) => n.includes("鸭吉吉"))).toBe(true);
  });
});

describe("parseSpiritNames", () => {
  it("should split by comma and newline", () => {
    expect(parseSpiritNames("a，b;c\n d")).toEqual(["a", "b", "c", "d"]);
  });
});

describe("querySpiritsWeakness", () => {
  it("should aggregate team weaknesses and remove any reduced side", () => {
    const r = querySpiritsWeakness("迪莫,花影羚羊");
    expect(r.hits).toHaveLength(2);
    expect(r.misses).toEqual([]);
    expect(r.summaryWeaknesses).toEqual([
      { type: "草", multiplier: 2 },
      { type: "光", multiplier: 3 },
      { type: "萌", multiplier: 2 },
      { type: "幽", multiplier: 2 }
    ]);
    expect(r.summaryResistances).toEqual(
      expect.arrayContaining([
        { type: "恶", multiplier: 0.5, spiritNames: ["迪莫"] },
        { type: "毒", multiplier: 0.5, spiritNames: ["花影羚羊"] }
      ])
    );
  });

  it("should exclude grass when any spirit has grass damage reduced", () => {
    const r = querySpiritsWeakness("迪莫,伊兰亚龙");
    expect(r.hits).toHaveLength(2);
    expect(r.summaryWeaknesses.some((item) => item.type === "草")).toBe(false);
  });

  it("should record misses", () => {
    const r = querySpiritsWeakness("迪莫,不存在某某");
    expect(r.hits).toHaveLength(1);
    expect(r.misses).toEqual(["不存在某某"]);
  });

  it("should keep only lowest multiplier spirit for a resistance type", () => {
    const r = querySpiritsWeakness("迪莫,伊兰亚龙");
    const grass = r.summaryResistances.find((item) => item.type === "草");
    expect(grass?.multiplier).toBe(0.5);
    expect(grass?.spiritNames).toEqual(["伊兰亚龙"]);
  });

  it("should keep all spirits when resistance multiplier ties", () => {
    const r = querySpiritsWeakness("嘟嘟煲,裘洛");
    const poison = r.summaryResistances.find((item) => item.type === "毒");
    expect(poison?.multiplier).toBe(0.5);
    expect(poison?.spiritNames).toEqual(expect.arrayContaining(["嘟嘟煲", "裘洛"]));
  });
});

describe("typeRelations consistency", () => {
  it("each type should have at least one resistedBy target", () => {
    Object.values(typeRelations).forEach((relation) => {
      expect(relation.resistedBy.length).toBeGreaterThan(0);
    });
  });
});
