import type { MultiSpiritQueryResult } from "../services/querySpirit";
import { typeColorMap } from "../data/typeStyle";
import { SpiritResult } from "./SpiritResult";

interface MultiSpiritResultsProps {
  data: MultiSpiritQueryResult;
}

function formatMult(m: number): string {
  if (m === 0.25 || m === 0.5) return String(m);
  if (Number.isInteger(m)) return `${m}.0`;
  return String(m);
}

export const MultiSpiritResults = ({ data }: MultiSpiritResultsProps) => {
  const spiritNames = data.hits.map((item) => item.spirit.name);

  return (
    <div className="multi-spirit-results">
      {data.misses.length > 0 ? (
        <p className="message multi-spirit-misses">
          未找到以下名称：{data.misses.join("、")}
        </p>
      ) : null}

      {data.hits.map((result, index) => (
        <SpiritResult key={`${result.spirit.id}-${index}`} result={result} />
      ))}

      {spiritNames.length > 0 ? (
        <section className="result-panel">
          <h2>精灵名称列表</h2>
          <div className="tags">
            {spiritNames.map((name, index) => (
              <span key={`${name}-${index}`} className="tag">
                {name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {data.hits.length > 0 ? (
        <section className="result-panel summary-panel">
          <h2>汇总 · 阵容弱点</h2>
          <p className="summary-hint">
            仅保留全队「受到伤害增加」且未被任一精灵「受到伤害降低」覆盖的属性；同一攻击属性在多只精灵上出现时取最大倍率。
          </p>
          {data.summaryWeaknesses.length > 0 ? (
            <div className="tags">
              {data.summaryWeaknesses.map((item) => (
                <span
                  key={`summary-${item.type}`}
                  className="tag tag-color modifier-tag"
                  style={{ backgroundColor: typeColorMap[item.type] }}
                >
                  {item.type}
                  <span className="modifier-coeff">×{formatMult(item.multiplier)}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="message">无阵容弱点数据。</p>
          )}

          <h2 className="section-title">汇总 · 阵容属性抗性</h2>
          <p className="summary-hint">
            只要任意精灵存在「受到伤害降低」即计入该属性；每个属性只展示最低倍率，并列最低倍率的精灵会全部展示。
          </p>
          {data.summaryResistances.length > 0 ? (
            <div className="summary-resistance-list">
              {data.summaryResistances.map((item) => (
                <div key={`res-${item.type}`} className="summary-resistance-item">
                  <span
                    className="tag tag-color modifier-tag"
                    style={{ backgroundColor: typeColorMap[item.type] }}
                  >
                    {item.type}
                    <span className="modifier-coeff">×{formatMult(item.multiplier)}</span>
                  </span>
                  <span className="summary-resistance-spirits">
                    {item.spiritNames.join("、")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="message">无阵容属性抗性数据。</p>
          )}
        </section>
      ) : null}
    </div>
  );
};
