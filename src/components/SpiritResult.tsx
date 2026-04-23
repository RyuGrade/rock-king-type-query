import type { DefensiveModifier, SpiritQueryResult } from "../services/querySpirit";
import { typeColorMap } from "../data/typeStyle";
import { TypeGraph } from "./TypeGraph";

interface SpiritResultProps {
  result: SpiritQueryResult;
}

function formatMult(m: number): string {
  if (m === 0.25 || m === 0.5) return String(m);
  if (Number.isInteger(m)) return `${m}.0`;
  return String(m);
}

function ModifierTags({ items, prefix }: { items: DefensiveModifier[]; prefix: string }) {
  if (items.length === 0) {
    return <p className="modifier-empty">无</p>;
  }
  return (
    <div className="tags modifier-tags">
      {items.map((item) => (
        <span
          key={`${prefix}-${item.type}`}
          className="tag tag-color modifier-tag"
          style={{ backgroundColor: typeColorMap[item.type] }}
        >
          {item.type}
          <span className="modifier-coeff">×{formatMult(item.multiplier)}</span>
        </span>
      ))}
    </div>
  );
}

export const SpiritResult = ({ result }: SpiritResultProps) => {
  return (
    <section className="result-panel">
      <h2>{result.spirit.name}</h2>
      <p>属性：{result.spirit.types.join(" / ")}</p>
      <div className="tags">
        {result.spirit.types.map((type) => (
          <span
            key={`spirit-type-${type}`}
            className="tag tag-color"
            style={{ backgroundColor: typeColorMap[type] }}
          >
            {type}
          </span>
        ))}
      </div>

      <div className="type-list">
        {result.typeWeakness.map((item) => (
          <div key={item.type} className="type-item">
            <h3>分系 · {item.type}</h3>
            <p className="modifier-label">受到伤害增加（相对基础伤害）</p>
            <ModifierTags items={item.damageIncreased} prefix={`inc-${item.type}`} />
            <p className="modifier-label">受到伤害降低</p>
            <ModifierTags items={item.damageReduced} prefix={`red-${item.type}`} />
            <div className="weakness-flow weakness-flow-compact">
              <span
                className="tag tag-color"
                style={{ backgroundColor: typeColorMap[item.type] }}
              >
                {item.type}
              </span>
              <span className="arrow">→</span>
              <div className="tags">
                {item.resistedBy.map((type) => (
                  <span
                    key={`flow-${item.type}-${type}`}
                    className="tag tag-color"
                    style={{ backgroundColor: typeColorMap[type] }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <TypeGraph centerType={item.type} resistedBy={item.resistedBy} />
          </div>
        ))}
      </div>

      <div className="spirit-whole-modifiers">
        <h3 className="spirit-whole-title">
          {result.spirit.types.length > 1 ? "整体（双属性合并规则）" : "整体"}
        </h3>
        <p className="modifier-label">弱点 · 受到伤害增加（大于降低侧抵消后）</p>
        <ModifierTags items={result.damageIncreased} prefix="whole-inc" />
        <p className="modifier-label">受到伤害降低</p>
        <ModifierTags items={result.damageReduced} prefix="whole-red" />
      </div>
    </section>
  );
};
