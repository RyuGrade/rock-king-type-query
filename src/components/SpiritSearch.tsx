import { useState } from "react";

interface SpiritSearchProps {
  onSearch: (keyword: string) => void;
  suggestions: string[];
  liveSearch: (keyword: string) => void;
}

export const SpiritSearch = ({ onSearch, suggestions, liveSearch }: SpiritSearchProps) => {
  const [keyword, setKeyword] = useState("");
  const replaceLastToken = (raw: string, selectedName: string): string => {
    const parts = raw.split(/([,，;；\n]+)/);
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      if (/^[,，;；\n]+$/.test(parts[i])) {
        continue;
      }
      const trimmed = parts[i].trim();
      if (trimmed.length > 0) {
        const leading = parts[i].match(/^\s*/)?.[0] ?? "";
        const trailing = parts[i].match(/\s*$/)?.[0] ?? "";
        parts[i] = `${leading}${selectedName}${trailing}`;
        return parts.join("");
      }
    }
    return raw + selectedName;
  };

  return (
    <form
      className="search-form search-form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(keyword);
      }}
    >
      <div className="search-input-wrap">
        <textarea
          className="search-input search-textarea"
          value={keyword}
          placeholder={
            "输入精灵名；多个可用英文逗号、中文逗号、分号或换行分隔\n例如：迪莫、花影羚羊、水灵"
          }
          rows={4}
          onChange={(event) => {
            const nextKeyword = event.target.value;
            setKeyword(nextKeyword);
            liveSearch(nextKeyword);
          }}
        />
        {suggestions.length > 0 ? (
          <div className="suggestion-chips" aria-label="名称联想">
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                className="suggestion-chip"
                onClick={() => {
                  const next = replaceLastToken(keyword, name);
                  setKeyword(next);
                  liveSearch(next);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <button className="search-button" type="submit">
        查询
      </button>
    </form>
  );
};
