import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Download, Eye, Filter, GitCompare, Search } from "lucide-react";

// =====================
// Types
// =====================
type AlignmentRow = {
  id: number;
  sequence1: string;
  sequence2: string;
  algorithm: string;
  aligned1: string;
  aligned2: string;
  score: number;
  identityPercent: number;
  createdAt: string;
};

// =====================
// Helpers
// =====================
function cleanDNA(s: string) {
  return (s ?? "").replace(/\s+/g, "").toUpperCase();
}
function shortSeq(s: string, n = 40) {
  const c = cleanDNA(s);
  return c.length <= n ? c : c.slice(0, n) + "…";
}
function downloadTextFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = String(v ?? "");
    if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(",")),
  ].join("\n");
}

function algoBadgeClass(algo: string) {
  if (algo?.includes("NEEDLEMAN")) return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-purple-100 text-purple-700 border-purple-200";
}

// =====================
// API
// =====================
async function fetchAlignments(): Promise<AlignmentRow[]> {
  const res = await fetch("/api/alignment/results");
  if (!res.ok) throw new Error(`GET /api/alignment/results -> ${res.status}`);
  return res.json();
}

// =====================
// Component
// =====================
export function AlignmentHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<AlignmentRow[]>([]);
  const [view, setView] = useState<AlignmentRow | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const data = await fetchAlignments();
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message ?? "Erreur fetch alignments");
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return rows.filter((r) => {
      const a = (r.algorithm ?? "").toLowerCase();
      const s1 = (r.sequence1 ?? "").toLowerCase();
      const s2 = (r.sequence2 ?? "").toLowerCase();
      return a.includes(q) || s1.includes(q) || s2.includes(q) || String(r.id).includes(q);
    });
  }, [rows, searchQuery]);

  const total = rows.length;
  const avgIdentity = useMemo(() => {
    if (!rows.length) return 0;
    const s = rows.reduce((acc, r) => acc + (r.identityPercent ?? 0), 0);
    return +(s / rows.length).toFixed(2);
  }, [rows]);

  const best = useMemo(() => {
    if (!rows.length) return null;
    return [...rows].sort((a, b) => (b.identityPercent ?? 0) - (a.identityPercent ?? 0))[0];
  }, [rows]);

  const exportCSV = () => {
    const csv = toCSV(rows.map(r => ({
      id: r.id,
      algorithm: r.algorithm,
      score: r.score,
      identityPercent: r.identityPercent,
      createdAt: r.createdAt,
      sequence1: cleanDNA(r.sequence1),
      sequence2: cleanDNA(r.sequence2),
    })));
    downloadTextFile("alignments.csv", csv, "text/csv");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <GitCompare className="w-7 h-7 text-blue-600" /> Alignment History
        </h2>
        <p className="text-gray-600">Browse and inspect saved alignment results</p>
        {err && <p className="text-sm text-red-600 mt-2">Erreur: {err}</p>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Alignments</p>
              <p className="text-2xl text-blue-600">{total}</p>
            </div>
            <GitCompare className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Identity</p>
              <p className="text-2xl text-purple-600">{avgIdentity}%</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-200 flex items-center justify-center text-purple-600 text-xs">
              AVG
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Best Identity</p>
              <p className="text-2xl text-green-600">{best ? `${best.identityPercent.toFixed(2)}%` : "—"}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center text-green-600 text-xs">
              BEST
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Actions */}
      <Card className="p-6 border-0 shadow-md">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by algorithm, id, sequence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>ID</TableHead>
                <TableHead>Algorithm</TableHead>
                <TableHead>Seq1</TableHead>
                <TableHead>Seq2</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Identity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-mono text-sm text-gray-600">{r.id}</TableCell>

                  <TableCell>
                    <Badge variant="outline" className={algoBadgeClass(r.algorithm)}>
                      {r.algorithm}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-gray-700">{shortSeq(r.sequence1)}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-700">{shortSeq(r.sequence2)}</TableCell>

                  <TableCell className="text-right text-gray-700">{r.score}</TableCell>
                  <TableCell className="text-right text-gray-700">{r.identityPercent?.toFixed(2)}%</TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" title="View" onClick={() => setView(r)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Download alignment"
                        onClick={() => {
                          const content =
                            `ID: ${r.id}\nAlgorithm: ${r.algorithm}\nScore: ${r.score}\nIdentity: ${r.identityPercent}%\n\n` +
                            `Aligned 1:\n${r.aligned1}\n\nAligned 2:\n${r.aligned2}\n`;
                          downloadTextFile(`alignment_${r.id}.txt`, content);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-gray-500 py-8">
                    No alignments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View Modal */}
      {view && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-[900px] max-w-[95vw] relative border-0 shadow-md">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl mb-1 flex items-center gap-2">
                  <GitCompare className="w-5 h-5" /> Alignment #{view.id}
                </h2>
                <p className="text-sm text-gray-600">
                  {view.algorithm} • score {view.score} • identity {view.identityPercent?.toFixed(2)}%
                </p>
              </div>
              <Button variant="ghost" onClick={() => setView(null)}>✕</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500 mb-1">Sequence 1 (raw)</p>
                <p className="font-mono text-xs break-all">{cleanDNA(view.sequence1)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500 mb-1">Sequence 2 (raw)</p>
                <p className="font-mono text-xs break-all">{cleanDNA(view.sequence2)}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-xl overflow-x-auto">
              <div className="font-mono text-xs space-y-2">
                <div className="text-gray-300 whitespace-pre">{view.aligned1}</div>
                <div className="text-gray-500 whitespace-pre">
                  {view.aligned1.split("").map((c, i) => (c === view.aligned2[i] ? "|" : " ")).join("")}
                </div>
                <div className="text-gray-300 whitespace-pre">{view.aligned2}</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
