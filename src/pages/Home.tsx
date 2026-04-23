import { useState } from "react";
import { MultiSpiritResults } from "../components/MultiSpiritResults";
import { SpiritSearch } from "../components/SpiritSearch";
import { suggestSpiritNames, querySpiritsWeakness, type MultiSpiritQueryResult } from "../services/querySpirit";

export const Home = () => {
  const [data, setData] = useState<MultiSpiritQueryResult | null>(null);
  const [message, setMessage] = useState("输入一个或多个精灵名，用逗号或换行分隔后查询");
  const [suggestions, setSuggestions] = useState<string[]>(suggestSpiritNames(""));

  const updateSuggestions = (raw: string) => {
    setSuggestions(suggestSpiritNames(raw));
  };

  const runQuery = (raw: string) => {
    if (!raw.trim()) {
      setData(null);
      setMessage("请输入精灵名，不能为空");
      return;
    }

    const result = querySpiritsWeakness(raw);
    if (result.hits.length === 0) {
      setData(null);
      setMessage(`未找到任何精灵：${result.misses.join("、")}`);
      return;
    }

    setData(result);
    setMessage("");
  };

  return (
    <main className="page">
      <h1>洛克王国 · 精灵被克制属性查询</h1>
      <p className="page-lead">支持一次输入多只精灵，将分别展示每只的克制关系，并在底部汇总并集结果。</p>
      <SpiritSearch onSearch={runQuery} suggestions={suggestions} liveSearch={updateSuggestions} />
      {message ? <p className="message">{message}</p> : null}
      {data ? <MultiSpiritResults data={data} /> : null}
    </main>
  );
};
