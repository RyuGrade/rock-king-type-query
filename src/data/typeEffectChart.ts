/**
 * BWIKI 克制计算器内嵌数据（与 Widget:RestrainCalc.js 一致）。
 * @see https://wiki.biligame.com/rocom/%E5%85%8B%E5%88%B6%E8%AE%A1%E7%AE%97%E5%99%A8
 */
export type TypeEffectEntry = {
  strong: string[];
  resist: string[];
  weak: string[];
  vulnerable: string[];
};

export const typeEffectChart = {
  普通: { strong: [""], resist: ["地", "幽", "机械"], weak: ["武"], vulnerable: ["幽"] },
  草: {
    strong: ["水", "光", "地"],
    resist: ["火", "龙", "毒", "虫", "翼", "机械"],
    weak: ["火", "冰", "毒", "虫", "翼"],
    vulnerable: ["水", "地", "电", "光"]
  },
  火: {
    strong: ["草", "冰", "虫", "机械"],
    resist: ["水", "地", "龙"],
    weak: ["水", "地"],
    vulnerable: ["草", "冰", "虫", "萌", "机械"]
  },
  水: {
    strong: ["火", "地", "机械"],
    resist: ["草", "冰", "龙"],
    weak: ["草", "电"],
    vulnerable: ["火", "机械"]
  },
  光: {
    strong: ["幽", "恶"],
    resist: ["草", "冰"],
    weak: ["草", "幽"],
    vulnerable: ["恶", "幻"]
  },
  地: {
    strong: ["火", "冰", "电", "毒"],
    resist: ["草", "武"],
    weak: ["草", "水", "冰", "武", "机械"],
    vulnerable: ["普通", "火", "电", "毒", "翼"]
  },
  冰: {
    strong: ["草", "地", "龙", "翼"],
    resist: ["火", "冰", "机械"],
    weak: ["火", "地", "武", "机械"],
    vulnerable: ["水", "冰", "光"]
  },
  龙: {
    strong: ["龙"],
    resist: ["机械"],
    weak: ["冰", "龙", "萌"],
    vulnerable: ["草", "火", "水", "电", "翼"]
  },
  电: {
    strong: ["水", "翼"],
    resist: ["草", "地", "龙", "电"],
    weak: ["地"],
    vulnerable: ["电", "翼", "机械"]
  },
  毒: {
    strong: ["草", "萌"],
    resist: ["地", "毒", "幽", "机械"],
    weak: ["地", "恶", "幻"],
    vulnerable: ["草", "毒", "虫", "武", "萌"]
  },
  虫: {
    strong: ["草", "恶", "幻"],
    resist: ["火", "毒", "武", "翼", "萌", "幽", "机械"],
    weak: ["火", "翼"],
    vulnerable: ["草", "武"]
  },
  武: {
    strong: ["普通", "地", "冰", "恶", "机械"],
    resist: ["毒", "虫", "翼", "萌", "幽", "幻"],
    weak: ["翼", "萌", "幻"],
    vulnerable: ["地", "虫", "恶"]
  },
  翼: {
    strong: ["草", "虫", "武"],
    resist: ["地", "龙", "电", "机械"],
    weak: ["冰", "电"],
    vulnerable: ["草", "虫", "武"]
  },
  萌: {
    strong: ["龙", "武", "恶"],
    resist: ["火", "毒", "机械"],
    weak: ["毒", "恶", "机械"],
    vulnerable: ["虫", "武"]
  },
  幽: {
    strong: ["光", "幽", "幻"],
    resist: ["普通", "恶"],
    weak: ["光", "幽", "恶"],
    vulnerable: ["普通", "毒", "虫", "武"]
  },
  恶: {
    strong: ["毒", "萌", "幽"],
    resist: ["光", "武", "恶"],
    weak: ["光", "虫", "武", "萌"],
    vulnerable: ["幽", "恶"]
  },
  机械: {
    strong: ["地", "冰", "萌"],
    resist: ["火", "水", "电", "机械"],
    weak: ["火", "水", "武"],
    vulnerable: ["普通", "草", "冰", "龙", "毒", "虫", "翼", "萌", "机械", "幻"]
  },
  幻: {
    strong: ["毒", "武"],
    resist: ["光", "机械", "幻"],
    weak: ["虫", "幽"],
    vulnerable: ["武", "幻"]
  }
} as const;

export type SpiritTypeFromChart = keyof typeof typeEffectChart;

/** 受到伤害增加 / 降低对应的倍率（与 BWIKI 克制计算器一致） */
export type DefensiveModifier = {
  type: SpiritTypeFromChart;
  /** 相对基础伤害的承受倍率：增加侧为 2 或 3，降低侧为 0.5 或 0.25 */
  multiplier: number;
};

const isChartType = (s: string): s is SpiritTypeFromChart =>
  s !== "" && s !== "无" && s in typeEffectChart;

function filterChartTypes(arr: readonly string[]): SpiritTypeFromChart[] {
  return arr.filter(isChartType);
}

type CountItem = { type: SpiritTypeFromChart; count: number; index: number };

function buildCountItems(combined: string[]): CountItem[] {
  const typeCount: Partial<Record<SpiritTypeFromChart, number>> = {};
  const typeOrder: SpiritTypeFromChart[] = [];
  for (const raw of combined) {
    if (!isChartType(raw)) continue;
    if (typeCount[raw] === undefined) {
      typeOrder.push(raw);
      typeCount[raw] = 0;
    }
    typeCount[raw]! += 1;
  }
  return typeOrder.map((type, index) => ({
    type,
    count: typeCount[type]!,
    index
  }));
}

function toModifiers(
  items: CountItem[],
  singleMult: number,
  overlapMult: number
): DefensiveModifier[] {
  return items.map((item) => ({
    type: item.type,
    multiplier: item.count > 1 ? overlapMult : singleMult
  }));
}

/** 单属性：受到伤害增加（×2）与受到伤害降低（×0.5） */
export function defensiveModifiersSingle(type: SpiritTypeFromChart): {
  damageIncreased: DefensiveModifier[];
  damageReduced: DefensiveModifier[];
} {
  const c = typeEffectChart[type];
  return {
    damageIncreased: filterChartTypes(c.weak).map((t) => ({ type: t, multiplier: 2 })),
    damageReduced: filterChartTypes(c.vulnerable).map((t) => ({ type: t, multiplier: 0.5 }))
  };
}

/** 双属性：弱/抗抵消后，增加侧 ×2/×3，降低侧 ×0.5/×0.25 */
export function defensiveModifiersDual(
  main: SpiritTypeFromChart,
  sub: SpiritTypeFromChart
): { damageIncreased: DefensiveModifier[]; damageReduced: DefensiveModifier[] } {
  const mainChart = typeEffectChart[main];
  const subChart = typeEffectChart[sub];
  const weakCombined = [...mainChart.weak, ...subChart.weak].filter((x) => x.length > 0);
  const vulnerableCombined = [...mainChart.vulnerable, ...subChart.vulnerable].filter(
    (x) => x.length > 0
  );

  let weakItems = buildCountItems(weakCombined);
  let vulnItems = buildCountItems(vulnerableCombined);
  const weakTypeSet = new Set(weakItems.map((i) => i.type));
  const vulnTypeSet = new Set(vulnItems.map((i) => i.type));
  const cancel = new Set([...weakTypeSet].filter((t) => vulnTypeSet.has(t)));

  weakItems = weakItems
    .filter((item) => !cancel.has(item.type))
    .sort((a, b) => b.count - a.count || a.index - b.index);
  vulnItems = vulnItems
    .filter((item) => !cancel.has(item.type))
    .sort((a, b) => b.count - a.count || a.index - b.index);

  return {
    damageIncreased: toModifiers(weakItems, 2, 3),
    damageReduced: toModifiers(vulnItems, 0.5, 0.25)
  };
}

/** 单属性：对其伤害为「弱」倍率的攻击方属性（受到伤害增加） */
export function defensiveWeakTypes(type: SpiritTypeFromChart): SpiritTypeFromChart[] {
  return defensiveModifiersSingle(type).damageIncreased.map((x) => x.type);
}

/** 双属性：与 Wiki 计算器相同的「弱」「抗」抵消后，剩余「受到伤害增加」方 */
export function defensiveWeakTypesDual(
  main: SpiritTypeFromChart,
  sub: SpiritTypeFromChart
): SpiritTypeFromChart[] {
  return defensiveModifiersDual(main, sub).damageIncreased.map((x) => x.type);
}
