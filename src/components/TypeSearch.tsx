import { useState } from "react";
import type { SpiritType } from "../data/types";

interface TypeSearchProps {
  onSearch: (keyword: string) => void;
  types: SpiritType[];
}

export const TypeSearch = ({ onSearch, types }: TypeSearchProps) => {
  const [keyword, setKeyword] = useState("");

  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(keyword);
      }}
    >
      <select
        className="search-input"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      >
        <option value="">请选择属性</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <button className="search-button" type="submit">
        查询属性克制
      </button>
    </form>
  );
};
