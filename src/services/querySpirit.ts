import {
  defensiveModifiersDual,
  defensiveModifiersSingle,
  type DefensiveModifier
} from "../data/typeEffectChart";
import { spirits, type Spirit } from "../data/spirits";
import { typeRelations, type SpiritType } from "../data/types";

export type { DefensiveModifier };

export interface TypeWeaknessResult {
  type: SpiritType;
  resistedBy: SpiritType[];
  /** 分系：来自该系的「受到伤害增加」 */
  damageIncreased: DefensiveModifier[];
  /** 分系：来自该系的「受到伤害降低」 */
  damageReduced: DefensiveModifier[];
}

export interface SpiritQueryResult {
  spirit: Spirit;
  typeWeakness: TypeWeaknessResult[];
  /** 精灵整体（单系即该系；双系为 BWIKI 双属性合并后）受到伤害增加 */
  damageIncreased: DefensiveModifier[];
  /** 精灵整体受到伤害降低 */
  damageReduced: DefensiveModifier[];
}

export interface MultiSpiritQueryResult {
  hits: SpiritQueryResult[];
  misses: string[];
  /**
   * 阵容弱点：仅保留全队「受到伤害增加」且未被任一精灵「受到伤害降低」覆盖的属性。
   * 同属性在多只精灵上出现时取更高倍率。
   */
  summaryWeaknesses: DefensiveModifier[];
  /**
   * 阵容属性抗性：只要任一精灵存在「受到伤害降低」即计入。
   * 每个属性只展示最低倍率（最抗），同倍率的精灵名全部保留。
   */
  summaryResistances: {
    type: SpiritType;
    multiplier: number;
    spiritNames: string[];
  }[];
}

const normalize = (value: string): string => value.trim().toLowerCase();

const allTypes = Object.keys(typeRelations) as SpiritType[];

function mergeTeamWeaknesses(hits: SpiritQueryResult[]): DefensiveModifier[] {
  const map = new Map<SpiritType, number>();
  const reducedSet = new Set<SpiritType>();
  for (const h of hits) {
    for (const { type, multiplier } of h.damageIncreased) {
      map.set(type, Math.max(map.get(type) ?? 0, multiplier));
    }
    for (const { type } of h.damageReduced) {
      reducedSet.add(type);
    }
  }
  return [...map.entries()]
    .filter(([type]) => !reducedSet.has(type))
    .sort((a, b) => allTypes.indexOf(a[0]) - allTypes.indexOf(b[0]))
    .map(([type, multiplier]) => ({ type, multiplier }));
}

function mergeTeamResistances(
  hits: SpiritQueryResult[]
): { type: SpiritType; multiplier: number; spiritNames: string[] }[] {
  const best = new Map<SpiritType, { multiplier: number; spiritNames: string[] }>();
  for (const h of hits) {
    for (const { type, multiplier } of h.damageReduced) {
      const current = best.get(type);
      if (!current || multiplier < current.multiplier) {
        best.set(type, { multiplier, spiritNames: [h.spirit.name] });
        continue;
      }
      if (multiplier === current.multiplier && !current.spiritNames.includes(h.spirit.name)) {
        current.spiritNames.push(h.spirit.name);
      }
    }
  }
  return [...best.entries()]
    .sort((a, b) => allTypes.indexOf(a[0]) - allTypes.indexOf(b[0]))
    .map(([type, info]) => ({
      type,
      multiplier: info.multiplier,
      spiritNames: info.spiritNames
    }));
}

export const findSpiritByName = (input: string): Spirit | null => {
  const keyword = normalize(input);
  if (!keyword) {
    return null;
  }

  const spirit = spirits.find((item) => {
    if (normalize(item.name) === keyword) {
      return true;
    }
    return item.aliases.some((alias) => normalize(alias) === keyword);
  });

  return spirit ?? null;
};

/** 按逗号、中文逗号、分号或换行分隔多个精灵名 */
export const parseSpiritNames = (raw: string): string[] =>
  raw
    .split(/[,，;；\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

export const querySpiritWeakness = (input: string): SpiritQueryResult | null => {
  const spirit = findSpiritByName(input);
  if (!spirit) {
    return null;
  }

  const typeWeakness = spirit.types.map((type) => {
    const m = defensiveModifiersSingle(type);
    return {
      type,
      resistedBy: typeRelations[type].resistedBy,
      damageIncreased: m.damageIncreased,
      damageReduced: m.damageReduced
    };
  });

  const combined =
    spirit.types.length === 2
      ? defensiveModifiersDual(spirit.types[0], spirit.types[1])
      : defensiveModifiersSingle(spirit.types[0]);

  return {
    spirit,
    typeWeakness,
    damageIncreased: combined.damageIncreased,
    damageReduced: combined.damageReduced
  };
};

/** 一次查询多只精灵；同名可重复查询，结果按输入顺序各展示一条 */
export const querySpiritsWeakness = (raw: string): MultiSpiritQueryResult => {
  const names = parseSpiritNames(raw);
  const hits: SpiritQueryResult[] = [];
  const misses: string[] = [];
  for (const name of names) {
    const one = querySpiritWeakness(name);
    if (one) hits.push(one);
    else misses.push(name);
  }
  return {
    hits,
    misses,
    summaryWeaknesses: mergeTeamWeaknesses(hits),
    summaryResistances: mergeTeamResistances(hits)
  };
};

export const queryTypeWeakness = (input: string): { type: SpiritType; resistedBy: SpiritType[] } | null => {
  const keyword = normalize(input);
  if (!keyword) {
    return null;
  }

  const matchedType = allTypes.find((type) => normalize(type) === keyword);
  if (!matchedType) {
    return null;
  }

  return {
    type: matchedType,
    resistedBy: typeRelations[matchedType].resistedBy
  };
};

/** 多行/多段输入时，用当前正在编辑的末段做联想 */
export const lastSpiritNameToken = (raw: string): string => {
  const parts = raw.split(/[,，;；\n]+/);
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const t = parts[i].trim();
    if (t) return t;
  }
  return raw.trim();
};

export const suggestSpiritNames = (input: string, limit = 8): string[] => {
  const keyword = normalize(lastSpiritNameToken(input));
  if (!keyword) {
    return [];
  }

  const matched = spirits.filter((spirit) => {
    if (normalize(spirit.name).includes(keyword)) {
      return true;
    }
    return spirit.aliases.some((alias) => normalize(alias).includes(keyword));
  });

  return matched.slice(0, limit).map((spirit) => spirit.name);
};
