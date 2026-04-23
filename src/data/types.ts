import {
  defensiveWeakTypes,
  type SpiritTypeFromChart,
  typeEffectChart
} from "./typeEffectChart";

/** 与 BWIKI 克制计算器、精灵图鉴一致的属性名 */
export type SpiritType = SpiritTypeFromChart;

export interface TypeRelation {
  type: SpiritType;
  resistedBy: SpiritType[];
}

/**
 * 各属性「被克制」方：攻击该属性时伤害为「弱」倍率的攻击方属性（Wiki 中「受到伤害增加」）。
 * 数据来自 BWIKI Widget:RestrainCalc.js。
 */
export const typeRelations: Record<SpiritType, TypeRelation> = Object.fromEntries(
  (Object.keys(typeEffectChart) as SpiritType[]).map((t) => [
    t,
    { type: t, resistedBy: defensiveWeakTypes(t) }
  ])
) as Record<SpiritType, TypeRelation>;
