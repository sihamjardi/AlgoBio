import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  FlaskConical, Search, Eye, Download, Filter, Loader2, GitCompare,
} from "lucide-react";

// =====================
// Types (API list)
// =====================
type MutationSimulationRow = {
  id: number;
  mutationType: "SUBSTITUTION" | "INSERTION" | "DELETION";
  mutationRate: number;
  variantsCount: number;
  alignmentAlgorithm: "NEEDLEMAN_WUNSCH" | "BLAST_SIMPLIFIED";
  createdAt: string;
  originalLength: number;
};

type MutationVariantRow = {
  id: number;
  createdAt: string;
  mutatedLength: number;
  score: number;
  identityPercent: number;
  mutatedSequence: string;
  alignedOriginal: string;
  alignedMutated: string;
};

// =====================
// Helpers
// =====================
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
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}
function badgeAlgo(a: string) {
  return a === "NEEDLEMAN_WUNSCH"
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-purple-100 text-purple-700 border-purple-200";
}
function badgeMutation(t: string) {
  if (t === "SUBSTITUTION") return "bg-amber-100 text-amber-800 border-amber-200";
  if (t === "INSERTION") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-rose-100 text-rose-700 border-rose-200";
}

// =====================
// API
// =====================
async function fetchSimulations(): Promise<MutationSimulationRow[]> {
  const res = await fetch("/api/mutations/simulations");
  if (!res.ok) throw new Error(`GET /api/mutations/simulations -> ${res.status}`);
  return res.json();
}
async function fetchVariants(simId: number): Promise<MutationVariantRow[]> {
  const res = await fetch(`/api/mutations/simulations/${simId}/variants`);
  if (!res.ok) throw new Error(`GET /api/mutations/simulations/${simId}/variants -> ${res.status}`);
  return res.json();
}

// =====================
// Component
// =====================
export function MutationSimulations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<MutationSimulationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // variants modal
  const [openSimId, setOpenSimId] = useState<number | null>(null);
  const [variants, setVariants] = useState<MutationVariantRow[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsErr, setVariantsErr] = useState<string | null>(null);

  // alignment modal
  const [openVariant, setOpenVariant] = useState<MutationVariantRow | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchSimulations();
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message ?? "Erreur fetch simulations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) => {
      const s = `${r.id} ${r.mutationType} ${r.alignmentAlgorithm} ${r.mutationRate} ${r.variantsCount}`.toLowerCase();
      return s.includes(q);
    });
  }, [rows, searchQuery]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const exportSelectedCSV = () => {
    const selected = rows.filter((r) => selectedIds.includes(r.id));
    const csv = toCSV(selected.map((r) => ({
      id: r.id,
      mutationType: r.mutationType,
      mutationRate: r.mutationRate,
      variantsCount: r.variantsCount,
      alignmentAlgorithm: r.alignmentAlgorithm,
      createdAt: r.createdAt,
      originalLength: r.originalLength,
    })));
    downloadTextFile("mutation_simulations.csv", csv, "text/csv");
  };

  const openVariants = async (simId: number) => {
    setOpenSimId(simId);
    setVariants([]);
    setVariantsErr(null);
    setVariantsLoading(true);
    try {
      const v = await fetchVariants(simId);
      setVariants(v);
    } catch (e: any) {
      setVariantsErr(e?.message ?? "Erreur fetch variants");
    } finally {
      setVariantsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <FlaskConical className="w-7 h-7 text-green-600" /> Mutation Library
        </h2>
        <p className="text-gray-600">Browse stored mutation simulations and their variants</p>
      </div>

      {/* Search */}
      <Card className="p-6 border-0 shadow-md">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search (type, algo, rate, id...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> More Filters
            </Button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-800">{selectedIds.length} simulation(s) selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportSelectedCSV}>
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>
            </div>
          )}

          {err && <div className="p-3 rounded bg-red-50 text-red-700 text-sm"><b>Erreur:</b> {err}</div>}
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filtered.map((r) => r.id));
                      else setSelectedIds([]);
                    }}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Mutation</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Variants</TableHead>
                <TableHead>Algorithm</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                    <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading && filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(r.id) ? "bg-green-50" : ""}`}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggle(r.id)}
                    />
                  </TableCell>

                  <TableCell className="font-mono text-sm text-gray-600">{r.id}</TableCell>

                  <TableCell>
                    <Badge variant="outline" className={badgeMutation(r.mutationType)}>
                      {r.mutationType}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right text-gray-600">{r.mutationRate}</TableCell>
                  <TableCell className="text-right text-gray-600">{r.variantsCount}</TableCell>

                  <TableCell>
                    <Badge variant="outline" className={badgeAlgo(r.alignmentAlgorithm)}>
                      {r.alignmentAlgorithm}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" title="View variants" onClick={() => openVariants(r.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-gray-500">
                    No simulations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Variants Modal */}
      {openSimId != null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-[1000px] max-w-[95vw] relative border-0 shadow-md">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl mb-1 flex items-center gap-2">
                  <GitCompare className="w-5 h-5" /> Simulation #{openSimId} – Variants
                </h2>
                <p className="text-sm text-gray-600">Stored mutation variants with alignment scores</p>
              </div>
              <Button variant="ghost" onClick={() => { setOpenSimId(null); setVariants([]); }}>
                ✕
              </Button>
            </div>

            {variantsLoading && (
              <div className="p-6 text-gray-600">
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> Loading variants...
              </div>
            )}

            {variantsErr && (
              <div className="p-3 rounded bg-red-50 text-red-700 text-sm mb-4">
                <b>Erreur:</b> {variantsErr}
              </div>
            )}

            {!variantsLoading && !variantsErr && (
              <div className="overflow-auto max-h-[60vh]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>ID</TableHead>
                      <TableHead className="text-right">Len</TableHead>
                      <TableHead className="text-right">Identity %</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((v) => (
                      <TableRow key={v.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm text-gray-600">{v.id}</TableCell>
                        <TableCell className="text-right text-gray-600">{v.mutatedLength}</TableCell>
                        <TableCell className="text-right font-medium">{v.identityPercent.toFixed(2)}%</TableCell>
                        <TableCell className="text-right">{v.score}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {v.createdAt ? new Date(v.createdAt).toLocaleString() : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" title="View alignment" onClick={() => setOpenVariant(v)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {variants.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                          No variants stored for this simulation.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Alignment Modal */}
      {openVariant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-[950px] max-w-[95vw] relative border-0 shadow-md">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl mb-1 flex items-center gap-2">
                  <GitCompare className="w-5 h-5" /> Variant #{openVariant.id} Alignment
                </h2>
                <p className="text-sm text-gray-600">
                  Identity: <b>{openVariant.identityPercent.toFixed(2)}%</b> • Score: <b>{openVariant.score}</b>
                </p>
              </div>
              <Button variant="ghost" onClick={() => setOpenVariant(null)}> ✕ </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
                <p className="text-sm text-gray-600 mb-2">Aligned Original</p>
                <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-800">
                  {openVariant.alignedOriginal}
                </pre>
              </Card>
              <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                <p className="text-sm text-gray-600 mb-2">Aligned Mutated</p>
                <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-800">
                  {openVariant.alignedMutated}
                </pre>
              </Card>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
