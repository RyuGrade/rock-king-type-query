import type { CSSProperties } from "react";
import type { SpiritType } from "../data/types";
import { typeColorMap } from "../data/typeStyle";

interface TypeGraphProps {
  centerType: SpiritType;
  resistedBy: SpiritType[];
}

export const TypeGraph = ({ centerType, resistedBy }: TypeGraphProps) => {
  return (
    <div className="type-graph">
      <div className="type-graph-center">
        <span className="tag tag-color" style={{ backgroundColor: typeColorMap[centerType] }}>
          {centerType}
        </span>
      </div>
      <div className="type-graph-ring">
        {resistedBy.map((type, index) => (
          <div
            key={`graph-${centerType}-${type}`}
            className="type-graph-node"
            style={
              {
                "--index": index,
                "--count": resistedBy.length
              } as CSSProperties
            }
          >
            <span className="type-graph-line" />
            <span className="tag tag-color" style={{ backgroundColor: typeColorMap[type] }}>
              {type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
