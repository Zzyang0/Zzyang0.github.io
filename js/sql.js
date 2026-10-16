// ============================================================
//  A tiny read-only SQL engine for the home-page console.
//  Supports: SHOW TABLES · DESCRIBE t · SELECT cols|*|COUNT(*) FROM t
//            [WHERE a = 'x' AND/OR b >= 3 · LIKE · IN (...)] [ORDER BY c [DESC]] [LIMIT n]
//  Database shape:  { tableName: { cols: ["a","b"], rows: [[..],[..]] } }  (cells: string | number | array | null)
// ============================================================
export class SqlError extends Error {}

const OPS = [">=", "<=", "<>", "!=", "=", "<", ">"];

function tokenize(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === "'" || ch === '"') {
      let j = i + 1, s = "";
      while (j < src.length && src[j] !== ch) s += src[j++];
      if (j >= src.length) throw new SqlError("ERROR 1064 (42000): unterminated string");
      out.push({ t: "str", v: s }); i = j + 1; continue;
    }
    const two = src.slice(i, i + 2);
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) { out.push({ t: "op", v: op }); i += op.length; continue; }
    if ("(),*".includes(ch)) { out.push({ t: ch, v: ch }); i++; continue; }
    const num = src.slice(i).match(/^-?\d+(\.\d+)?/);
    if (num) { out.push({ t: "num", v: Number(num[0]) }); i += num[0].length; continue; }
    const id = src.slice(i).match(/^[A-Za-z_\u4e00-\u9fff][A-Za-z0-9_.\u4e00-\u9fff]*/);
    if (id) { out.push({ t: "id", v: id[0].split(".").pop() }); i += id[0].length; continue; }
    throw new SqlError(`ERROR 1064 (42000): syntax error near '${src.slice(i, i + 12)}'`);
  }
  return out;
}

const likeRe = (pat) => new RegExp("^" + String(pat).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", "i");

function compare(cell, op, val) {
  const s = (x) => String(x).toLowerCase();
  if (Array.isArray(cell)) {
    const arr = cell.map(s);
    if (op === "=") return arr.includes(s(val));
    if (op === "!=" || op === "<>") return !arr.includes(s(val));
    if (op === "like") return likeRe(val).test(arr.join(", "));
    return false;
  }
  if (cell == null) return false;
  if (op === "like") return likeRe(val).test(String(cell));
  let a = cell, b = val;
  if (typeof a === "number" || typeof b === "number") {
    a = Number(a); b = Number(b);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
  } else { a = s(a); b = s(b); }
  switch (op) {
    case "=": return a === b;
    case "!=": case "<>": return a !== b;
    case ">": return a > b;
    case "<": return a < b;
    case ">=": return a >= b;
    case "<=": return a <= b;
  }
  return false;
}

export function runSQL(src, db) {
  const text = src.trim().replace(/;+\s*$/, "");
  if (!text) return null;
  const toks = tokenize(text);
  let p = 0;
  const peek = () => toks[p];
  const isKw = (k) => peek()?.t === "id" && peek().v.toLowerCase() === k;
  const eatKw = (k) => (isKw(k) ? (p++, true) : false);
  const near = () => (peek() ? String(peek().v) : "end of input");
  const syntax = () => new SqlError(`ERROR 1064 (42000): You have an error in your SQL syntax near '${near()}'`);
  const expectKw = (k) => { if (!eatKw(k)) throw syntax(); };
  const tableOf = (name) => {
    const key = String(name).toLowerCase();
    if (!db[key]) throw new SqlError(`ERROR 1146 (42S02): Table 'frank.${name}' doesn't exist`);
    return [key, db[key]];
  };

  if (eatKw("show")) {
    if (!eatKw("tables")) throw syntax();
    const names = Object.keys(db);
    return { kind: "table", cols: ["table", "rows"], rows: names.map((n) => [n, db[n].rows.length]), table: null };
  }
  if (eatKw("describe") || eatKw("desc")) {
    if (peek()?.t !== "id") throw syntax();
    const [name, tbl] = tableOf(toks[p++].v);
    return { kind: "table", cols: ["column", "sample"], rows: tbl.cols.map((c, i) => [c, tbl.rows[0] ? (Array.isArray(tbl.rows[0][i]) ? "list" : typeof tbl.rows[0][i]) : "?"]), table: name };
  }
  if (!eatKw("select")) throw syntax();

  // select list
  let wanted = null, count = false;
  if (peek()?.t === "*") { p++; }
  else if (isKw("count")) {
    p++;
    if (peek()?.t !== "(") throw syntax(); p++;
    if (peek()?.t !== "*") throw syntax(); p++;
    if (peek()?.t !== ")") throw syntax(); p++;
    count = true;
  } else {
    wanted = [];
    do {
      if (peek()?.t !== "id") throw syntax();
      wanted.push(toks[p++].v);
    } while (peek()?.t === "," && (p++, true));
  }
  expectKw("from");
  if (peek()?.t !== "id") throw syntax();
  const [tname, tbl] = tableOf(toks[p++].v);

  const colIndex = (name, where) => {
    const n = String(name).toLowerCase();
    let i = tbl.cols.findIndex((c) => c.toLowerCase() === n);
    if (i < 0 && n === "tag") i = tbl.cols.findIndex((c) => c === "tags");
    if (i < 0) throw new SqlError(`ERROR 1054 (42S22): Unknown column '${name}' in '${where}'`);
    return i;
  };

  // WHERE
  const value = () => {
    const tk = peek();
    if (!tk || !["str", "num"].includes(tk.t)) throw syntax();
    p++; return tk.v;
  };
  const cond = () => {
    if (peek()?.t === "(") {
      p++; const e = expr();
      if (peek()?.t !== ")") throw syntax(); p++;
      return e;
    }
    if (peek()?.t !== "id") throw syntax();
    const idx = colIndex(toks[p++].v, "where clause");
    if (eatKw("like")) { const v = value(); return (r) => compare(r[idx], "like", v); }
    if (eatKw("in")) {
      if (peek()?.t !== "(") throw syntax(); p++;
      const vals = [];
      do { vals.push(value()); } while (peek()?.t === "," && (p++, true));
      if (peek()?.t !== ")") throw syntax(); p++;
      return (r) => vals.some((v) => compare(r[idx], "=", v));
    }
    if (peek()?.t !== "op") throw syntax();
    const op = toks[p++].v;
    const v = value();
    return (r) => compare(r[idx], op, v);
  };
  const andExpr = () => { let l = cond(); while (eatKw("and")) { const a = l, b = cond(); l = (r) => a(r) && b(r); } return l; };
  const expr = () => { let l = andExpr(); while (eatKw("or")) { const a = l, b = andExpr(); l = (r) => a(r) || b(r); } return l; };

  let filter = () => true;
  if (eatKw("where")) filter = expr();

  const order = [];
  if (eatKw("order")) {
    expectKw("by");
    do {
      if (peek()?.t !== "id") throw syntax();
      const idx = colIndex(toks[p++].v, "order clause");
      const desc = eatKw("desc") ? true : (eatKw("asc"), false);
      order.push([idx, desc]);
    } while (peek()?.t === "," && (p++, true));
  }
  let limit = Infinity;
  if (eatKw("limit")) {
    const tk = peek();
    if (tk?.t !== "num") throw syntax();
    p++; limit = tk.v;
  }
  if (p < toks.length) throw syntax();

  let rows = tbl.rows.filter(filter);
  if (order.length) {
    rows = [...rows].sort((a, b) => {
      for (const [i, desc] of order) {
        const x = a[i], y = b[i];
        const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        if (c) return desc ? -c : c;
      }
      return 0;
    });
  }
  if (count) return { kind: "table", cols: ["count(*)"], rows: [[rows.length]], table: tname };
  rows = rows.slice(0, limit);
  const idxs = wanted ? wanted.map((w) => colIndex(w, "field list")) : tbl.cols.map((_, i) => i);
  return { kind: "table", cols: idxs.map((i) => tbl.cols[i]), rows: rows.map((r) => idxs.map((i) => r[i])), table: tname };
}
