// AIClassificationHistory.tsx
import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Sparkles, Search, Eye, Download, Filter, Loader2, Microscope, Database, Clock,
} from "lucide-react";

// =====================
// Types
// =====================
type TopKItem = { label: string; prob: number };
type ClassificationRow = {
  id: number;
  sequence: string;
  label_type: string;
  prediction: string;
  prob: number;
  top_k: TopKItem[];
  reason?: string | null;
  created_at: string;
};

// =====================
// Helpers
// =====================
function cleanDNA(s: string) {
  return (s ?? "").replace(/\s+/g, "").toUpperCase();
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
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

function badgePrediction(pred: string) {
  if (pred === "unknown") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-purple-100 text-purple-700 border-purple-200";
}

function badgeReason(reason?: string | null) {
  if (!reason) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (reason === "low_confidence") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-rose-100 text-rose-700 border-rose-200";
}

// =====================
// API (robuste)
// =====================
const API_BASE = "/api/ai"; // <-- IMPORTANT: doit être routé vers FastAPI

async function safeJson<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Backend did not return JSON (content-type=${ct}). First chars: ${text.slice(0, 40)}`
    );
  }
  return res.json();
}

async function fetchClassifications(limit = 500): Promise<ClassificationRow[]> {
  const res = await fetch(`${API_BASE}/classifications?limit=${limit}`);
  const data = await safeJson<any>(res);
  return Array.isArray(data) ? data : [];
}

async function fetchClassificationById(id: number): Promise<ClassificationRow> {
  const res = await fetch(`${API_BASE}/classifications/${id}`);
  return safeJson<ClassificationRow>(res);
}

// =====================
// Component
// =====================
export function AIClassificationHistory() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<ClassificationRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [filterUnknown, setFilterUnknown] =
    useState<"all" | "only_unknown" | "only_known">("all");

  const [viewId, setViewId] = useState<number | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewErr, setViewErr] = useState<string | null>(null);
  const [viewRow, setViewRow] = useState<ClassificationRow | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchClassifications(500);
        setRows(data);
      } catch (e: any) {
        setErr(e?.message ?? "Erreur fetch classifications");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const unknown = rows.filter((r) => r.prediction === "unknown").length;
    const known = total - unknown;
    const last = rows[0]?.created_at;
    return { total, unknown, known, last };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((r) => {
      const pred = (r.prediction ?? "").toLowerCase();
      const reason = (r.reason ?? "").toLowerCase();
      const labelType = (r.label_type ?? "").toLowerCase();
      const seq = (r.sequence ?? "").toLowerCase();

      const matchesQuery =
        !q ||
        pred.includes(q) ||
        reason.includes(q) ||
        labelType.includes(q) ||
        seq.includes(q) ||
        String(r.id).includes(q);

      const matchesFilter =
        filterUnknown === "all" ||
        (filterUnknown === "only_unknown" && r.prediction === "unknown") ||
        (filterUnknown === "only_known" && r.prediction !== "unknown");

      return matchesQuery && matchesFilter;
    });
  }, [rows, searchQuery, filterUnknown]);

  const exportAllCSV = () => {
    const data = filteredRows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      label_type: r.label_type,
      prediction: r.prediction,
      prob: r.prob,
      reason: r.reason ?? "",
      sequence_len: cleanDNA(r.sequence).length,
      sequence: cleanDNA(r.sequence),
      top_k: JSON.stringify(r.top_k ?? []),
    }));
    downloadTextFile("ai_classifications.csv", toCSV(data), "text/csv");
  };

  const openDetails = async (id: number) => {
    setViewId(id);
    setViewErr(null);
    setViewRow(null);

    const local = rows.find((x) => x.id === id);
    if (local) setViewRow(local);

    setViewLoading(true);
    try {
      const fresh = await fetchClassificationById(id);
      setViewRow(fresh);
    } catch (e: any) {
      setViewErr(e?.message ?? "Erreur détails");
    } finally {
      setViewLoading(false);
    }
  };

  const closeDetails = () => {
    setViewId(null);
    setViewRow(null);
    setViewErr(null);
    setViewLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-600" /> AI Classification Library
        </h2>
        <p className="text-gray-600">Browse saved predictions from the FastAPI classifier</p>
        {err && <p className="mt-2 text-sm text-red-600">Erreur: {err}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Classifications</p>
              <p className="text-2xl text-purple-700">{stats.total}</p>
            </div>
            <Database className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-gray-50 to-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Unknown (low confidence)</p>
              <p className="text-2xl text-gray-700">{stats.unknown}</p>
            </div>
            <Microscope className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Activity</p>
              <p className="text-sm text-gray-700">
                {stats.last ? new Date(stats.last).toLocaleString() : "—"}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 border-0 shadow-md">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID, prediction, reason, label_type, sequence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                className="border rounded px-3 py-2 text-sm"
                value={filterUnknown}
                onChange={(e) => setFilterUnknown(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="only_known">Only known</option>
                <option value="only_unknown">Only unknown</option>
              </select>

              <Button variant="outline" onClick={exportAllCSV} disabled={!filteredRows.length}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilterUnknown("all");
                }}
              >
                <Filter className="w-4 h-4 mr-2" /> Reset
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {loading ? "Loading..." : `${filteredRows.length} result(s)`}
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
                <TableHead>Prediction</TableHead>
                <TableHead className="text-right">Prob</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Label type</TableHead>
                <TableHead className="text-right">Seq Len</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex items-center gap-2 text-sm text-gray-600 p-3">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading classifications...
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading && filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="text-sm text-gray-600 p-3">No data.</div>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredRows.map((r) => {
                  const seqLen = cleanDNA(r.sequence).length;
                  return (
                    <TableRow key={r.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm text-gray-600">{r.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={badgePrediction(r.prediction)}>
                          {r.prediction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-gray-700">
                        {(r.prob * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={badgeReason(r.reason)}>
                          {r.reason ? r.reason : "ok"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700">{r.label_type}</TableCell>
                      <TableCell className="text-right text-gray-600">{seqLen}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetails(r.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Details Modal */}
      {viewId != null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-[980px] max-w-[95vw] relative border-0 shadow-md">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Classification #{viewId}
                </h2>

                {viewRow && (
                  <p className="text-sm text-gray-600">
                    Prediction:{" "}
                    <Badge variant="outline" className={badgePrediction(viewRow.prediction)}>
                      {viewRow.prediction}
                    </Badge>{" "}
                    • Prob: <b>{(viewRow.prob * 100).toFixed(2)}%</b> • Reason:{" "}
                    <Badge variant="outline" className={badgeReason(viewRow.reason)}>
                      {viewRow.reason ? viewRow.reason : "ok"}
                    </Badge>
                  </p>
                )}

                {viewErr && <p className="text-sm text-red-600 mt-1">Erreur: {viewErr}</p>}
              </div>

              <Button variant="ghost" onClick={closeDetails}>
                ✕
              </Button>
            </div>

            {viewLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading details...
              </div>
            )}

            {viewRow && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
                  <p className="text-sm text-gray-600 mb-2">Sequence</p>
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-800">
                    {cleanDNA(viewRow.sequence)}
                  </pre>
                </Card>

                <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                  <p className="text-sm text-gray-600 mb-2">Top-K</p>
                  <div className="space-y-2">
                    {(viewRow.top_k ?? []).map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate">{t.label}</span>
                        <span className="text-gray-900 font-medium">
                          {(t.prob * 100).toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
