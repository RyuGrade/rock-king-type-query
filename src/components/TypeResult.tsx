import type { TypeWeaknessResult } from "../services/querySpirit";
import { typeColorMap } from "../data/typeStyle";
import { TypeGraph } from "./TypeGraph";

interface TypeResultProps {
  result: TypeWeaknessResult;
}

export const TypeResult = ({ result }: TypeResultProps) => {
  return (
    <section className="result-panel">
      <h2>{result.type}系</h2>
      <div className="weakness-flow">
        <span className="tag tag-color" style={{ backgroundColor: typeColorMap[result.type] }}>
          {result.type}
        </span>
        <span className="arrow">→</span>
        <div className="tags">
          {result.resistedBy.map((type) => (
            <span
              key={`type-result-${type}`}
              className="tag tag-color"
              style={{ backgroundColor: typeColorMap[type] }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
      <div className="summary">
        <strong>被克制属性：</strong>
        {result.resistedBy.join("、")}
      </div>
      <TypeGraph centerType={result.type} resistedBy={result.resistedBy} />
    </section>
  );
};
