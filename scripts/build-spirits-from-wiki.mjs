/**
 * 从 BWIKI「精灵图鉴」导出的 Markdown 解析精灵编号、名称、形态、属性。
 * 用法: node scripts/build-spirits-from-wiki.mjs <markdown路径>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inPath = process.argv[2] ?? path.join(__dirname, "../src/data/wiki-spirits-source.md");
const outPath = path.join(__dirname, "../src/data/spirits.ts");

const text = fs.readFileSync(inPath, "utf8");
const lines = text.split(/\r?\n/);

/** @typedef {{ no: string, name: string, variant: string, types: string[] }} Raw */

/** @type {Raw[]} */
const raw = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const m = line?.match(/^NO\.(\d+)$/);
  if (!m) {
    i += 1;
    continue;
  }
  const no = m[1];
  i += 1;
  while (i < lines.length && lines[i].trim() === "") i += 1;
  if (i >= lines.length) break;
  const name = lines[i].trim();
  i += 1;
  let variant = "";
  while (i < lines.length && lines[i].trim() === "") i += 1;
  if (
    i < lines.length &&
    lines[i].trim() &&
    !lines[i].startsWith("页面") &&
    !lines[i].startsWith("NO.") &&
    !lines[i].includes("图标 宠物 属性")
  ) {
    variant = lines[i].trim();
    i += 1;
  }
  while (i < lines.length && lines[i].trim() === "") i += 1;
  while (i < lines.length && !lines[i].includes("图标 宠物 属性")) {
    if (lines[i].startsWith("NO.")) break;
    i += 1;
  }
  if (i >= lines.length || !lines[i]?.includes("图标 宠物 属性")) {
    continue;
  }
  const iconLine = lines[i];
  const types = [...iconLine.matchAll(/属性\s*(\S+?)\.png/g)].map((x) => x[1]);
  i += 1;
  if (name && types.length >= 1) {
    raw.push({ no, name, variant, types });
  }
}

let seq = 0;
const body = raw
  .map((row) => {
    const display = row.variant ? `${row.name}（${row.variant}）` : row.name;
    const t0 = row.types[0];
    const t1 = row.types[1];
    const typesStr =
      t1 !== undefined ? `["${t0}", "${t1}"]` : `["${t0}"]`;
    const aliases = [row.name, display];
    if (row.variant) aliases.push(row.variant);
    const uniq = new Set(aliases);
    const aliasStr = [...uniq].map((a) => `"${a.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(", ");
    const id = `w${String(seq++).padStart(4, "0")}`;
    const safeDisplay = display.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `  { id: "${id}", name: "${safeDisplay}", aliases: [${aliasStr}], types: ${typesStr} as const }`;
  })
  .join(",\n");

const file = `import type { SpiritType } from "./types";

export interface Spirit {
  id: string;
  name: string;
  aliases: string[];
  types: [SpiritType] | [SpiritType, SpiritType];
}

/** 数据摘自 BWIKI《洛克王国》手游精灵图鉴（2026-04-05 版本快照），属性以图鉴页为准。 */
export const spirits: Spirit[] = [
${body}
];
`;

fs.writeFileSync(outPath, file, "utf8");
console.error(`Wrote ${raw.length} spirits to ${outPath}`);
