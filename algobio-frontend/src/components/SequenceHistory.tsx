import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Database,
  Search,
  Eye,
  GitCompare,
  Sparkles,
  Trash2,
  Download,
  Filter,
  Loader2,
} from "lucide-react";


// =====================
// Types
// =====================
type Sequence = {
  id: number;
  name: string;
  sequence: string;
  length?: number;
  classification?: string;
  createdAt?: string;
};

type AlignmentAlgorithm = "NEEDLEMAN_WUNSCH" | "BLAST_SIMPLIFIED";

type AlignmentRequest = {
  seq1: string;
  seq2: string;
  algorithm: AlignmentAlgorithm;
};

type AlignmentResponse = {
  alignedSeq1: string;
  alignedSeq2: string;
  score: number;
  identityPercent: number;
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
function HumanDNAModel() {
  const { scene } = useGLTF("/models/human_dna/scene.gltf");
  return <primitive object={scene} scale={1.2} />;
}
useGLTF.preload("/models/human_dna/scene.gltf");

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

function cleanDNA(s: string) {
  return (s ?? "").replace(/\s+/g, "").toUpperCase();
}



function gcPercent(seq: string) {
  const s = cleanDNA(seq);
  if (!s.length) return 0;
  const gc = (s.match(/[GC]/g) || []).length;
  return +(100 * (gc / s.length)).toFixed(2);
}

function classifyHeuristic(seq: string) {
  const s = cleanDNA(seq);
  const len = s.length;
  const gc = gcPercent(s);

  if (len < 30) return { label: "Short fragment", reason: "len < 30" };
  if (gc >= 60) return { label: "GC-rich", reason: "GC% >= 60" };
  if (gc <= 40) return { label: "AT-rich", reason: "GC% <= 40" };
  return { label: "Generic DNA", reason: "40 < GC% < 60" };
}

// =====================
// API calls
// =====================
// Ici on utilise le proxy Vite: fetch("/api/...") => gateway
async function fetchSequences(): Promise<Sequence[]> {
  const res = await fetch("/api/sequences");
  if (!res.ok) throw new Error(`GET /api/sequences -> ${res.status}`);
  return res.json();
}

// Alignment endpoint attendu: POST /api/alignment
async function align(req: AlignmentRequest): Promise<AlignmentResponse> {
  const res = await fetch("/api/alignment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `POST /api/alignment -> ${res.status}`);
  }
  return res.json();
}

// =====================
// Component
// =====================
export function SequenceHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSequences, setSelectedSequences] = useState<number[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [view3DSequence, setView3DSequence] = useState<Sequence | null>(null);

  // Compare modal state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareAlgo, setCompareAlgo] =
    useState<AlignmentAlgorithm>("NEEDLEMAN_WUNSCH");
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareResults, setCompareResults] = useState<
    { a: Sequence; b: Sequence; score: number; identity: number }[]
  >([]);

  const [classifyOpen, setClassifyOpen] = useState(false);
  const [classifyRows, setClassifyRows] = useState<
    { id: number; name: string; length: number; gc: number; predicted: string; reason: string }[]
  >([]);

  const toggleSequenceSelection = (id: number) => {
    setSelectedSequences((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchSequences();
        setSequences(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("fetch sequences error =", e);
      }
    })();
  }, []);



  const filteredSequences = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sequences.filter((seq) => {
      const name = (seq?.name ?? "").toLowerCase();
      const s = (seq?.sequence ?? "").toLowerCase();
      return name.includes(q) || s.includes(q) || "adn".includes(q);
    });
  }, [sequences, searchQuery]);

  const selectedObjects = useMemo(() => {
    const map = new Map(sequences.map((s) => [s.id, s]));
    return selectedSequences.map((id) => map.get(id)).filter(Boolean) as Sequence[];
  }, [selectedSequences, sequences]);

  const getTypeColor = (_type: string) => "bg-blue-100 text-blue-700 border-blue-200";

  // =====================
  // Quick Actions
  // =====================

  const exportAllSequences = () => {
    const rows = sequences.map((s) => ({
      id: s.id,
      name: s.name,
      sequence: cleanDNA(s.sequence),
      length: cleanDNA(s.sequence).length,
      classification: s.classification ?? "",
      createdAt: s.createdAt ?? "",
      gcPercent: gcPercent(s.sequence),
    }));
    const csv = toCSV(rows);
    downloadTextFile("sequences.csv", csv, "text/csv");
  };

  const batchCompare = async () => {
    setCompareError(null);
    setCompareResults([]);
    if (selectedObjects.length < 2) {
      setCompareError("Select min 2 sequences to compare.");
      setCompareOpen(true);
      return;
    }

    const MAX = 10;
    const list = selectedObjects.slice(0, MAX);

    const pairs: [Sequence, Sequence][] = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) pairs.push([list[i], list[j]]);
    }

    try {
      setCompareLoading(true);
      setCompareOpen(true);

      const results = await Promise.all(
        pairs.map(async ([a, b]) => {
          const res = await align({
            seq1: cleanDNA(a.sequence),
            seq2: cleanDNA(b.sequence),
            algorithm: compareAlgo,
          });
          return { a, b, score: res.score, identity: res.identityPercent };
        })
      );

      // tri: plus similaire en haut
      results.sort((r1, r2) => r2.identity - r1.identity);
      setCompareResults(results);
    } catch (e: any) {
      setCompareError(e?.message || "Erreur compare");
    } finally {
      setCompareLoading(false);
    }
  };

  const batchClassify = () => {
    if (!selectedObjects.length) {
      setClassifyRows([]);
      setClassifyOpen(true);
      return;
    }
    const rows = selectedObjects.map((s) => {
      const seq = cleanDNA(s.sequence);
      const pred = classifyHeuristic(seq);
      return {
        id: s.id,
        name: s.name,
        length: seq.length,
        gc: gcPercent(seq),
        predicted: pred.label,
        reason: pred.reason,
      };
    });
    setClassifyRows(rows);
    setClassifyOpen(true);
  };

  const exportClassifyReport = () => {
    const csv = toCSV(classifyRows);
    downloadTextFile("classification_report.csv", csv, "text/csv");
  };

  // =====================
  // Render
  // =====================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <Database className="w-7 h-7 text-blue-600" /> Sequence Library
        </h2>
        <p className="text-gray-600">Manage and organize your saved sequences</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total DNA Sequences</p>
              <p className="text-2xl text-blue-600">{sequences.length}</p>
            </div>
            <Database className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Genes</p>
              <p className="text-2xl text-purple-600">
                {sequences.filter((s) => s.classification === "Gene").length}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-200 flex items-center justify-center text-purple-600 text-xs">
              GEN
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Viral DNA</p>
              <p className="text-2xl text-green-600">
                {sequences.filter((s) => s.classification === "Virus").length}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center text-green-600 text-xs">
              VIR
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 border-0 shadow-md">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> More Filters
            </Button>
          </div>

          {selectedSequences.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedSequences.length} sequence(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={batchCompare}>
                  <GitCompare className="w-4 h-4 mr-2" /> Compare
                </Button>
                <Button size="sm" variant="outline" onClick={exportAllSequences}>
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Sequences Table */}
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
                      if (e.target.checked) setSelectedSequences(filteredSequences.map((s) => s.id));
                      else setSelectedSequences([]);
                    }}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sequence</TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSequences.map((seq) => {
                const seqClean = cleanDNA(seq.sequence);
                return (
                  <TableRow
                    key={seq.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedSequences.includes(seq.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedSequences.includes(seq.id)}
                        onChange={() => toggleSequenceSelection(seq.id)}
                      />
                    </TableCell>

                    <TableCell className="font-mono text-sm text-gray-600">{seq.id}</TableCell>
                    <TableCell><p>{seq.name}</p></TableCell>

                    <TableCell>
                      <Badge variant="outline" className={getTypeColor("ADN")}>ADN</Badge>
                    </TableCell>

                    <TableCell><p className="break-all">{seqClean}</p></TableCell>

                    <TableCell className="text-gray-600">{seqClean.length} bp</TableCell>

                    <TableCell>
                      <span className="text-sm text-gray-700">{seq.classification}</span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {[seq.name, "ADN"].map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-gray-600">
                      {seq.createdAt ? new Date(seq.createdAt).toLocaleString() : ""}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View 3D"
                          onClick={() => setView3DSequence(seq)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Compare" onClick={() => {
                          setSelectedSequences([seq.id]);
                          setCompareOpen(true);
                          setCompareError("Sélectionne au moins 2 séquences pour comparer.");
                        }}>
                          <GitCompare className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Classify" onClick={() => {
                          setSelectedSequences([seq.id]);
                          batchClassify();
                        }}>
                          <Sparkles className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Quick Actions */}
      <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-gray-50 to-blue-50">
        <h3 className="mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" className="justify-start" onClick={exportAllSequences}>
            <Download className="w-4 h-4 mr-2" /> Export All Sequences
          </Button>

          <Button variant="outline" className="justify-start" onClick={batchCompare}>
            <GitCompare className="w-4 h-4 mr-2" /> Batch Compare
          </Button>

          <Button variant="outline" className="justify-start" onClick={batchClassify}>
            <Sparkles className="w-4 h-4 mr-2" /> Batch Classify
          </Button>
        </div>
      </Card>

      {/* 3D Modal */}
      {view3DSequence && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-4 w-[700px] h-[520px] relative">
            <h2 className="text-xl mb-2">{view3DSequence.name} – DNA 3D Model</h2>

            <div className="w-full h-[430px] rounded border bg-white overflow-hidden">
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 2, 2]} intensity={1} />
                <Suspense fallback={<div className="p-4">Loading 3D model...</div>}>
                  <HumanDNAModel />
                </Suspense>

                <OrbitControls makeDefault />
              </Canvas>
            </div>

            <Button
              className="absolute top-2 right-2"
              variant="ghost"
              onClick={() => setView3DSequence(null)}
            >
              ✕
            </Button>
          </Card>
        </div>
      )}


      {/* Compare Modal */}
      {compareOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-[900px] max-w-[95vw] relative border-0 shadow-md">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl mb-1 flex items-center gap-2">
                  <GitCompare className="w-5 h-5" /> Batch Compare
                </h2>
                <p className="text-sm text-gray-600">
                  Compare les séquences sélectionnées via l’endpoint <code>/api/alignment</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={compareAlgo}
                  onChange={(e) => setCompareAlgo(e.target.value as AlignmentAlgorithm)}
                  disabled={compareLoading}
                >
                  <option value="NEEDLEMAN_WUNSCH">Needleman–Wunsch</option>
                  <option value="BLAST_SIMPLIFIED">BLAST simplified</option>
                </select>

                <Button variant="outline" onClick={batchCompare} disabled={compareLoading}>
                  {compareLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Comparing...
                    </>
                  ) : (
                    "Run"
                  )}
                </Button>

                <Button variant="ghost" onClick={() => setCompareOpen(false)}>✕</Button>
              </div>
            </div>

            {compareError && (
              <div className="p-3 rounded bg-red-50 text-red-700 text-sm mb-4">
                <b>Erreur:</b> {compareError}
              </div>
            )}

            {!compareError && !compareResults.length && !compareLoading && (
              <div className="p-4 bg-gray-50 rounded text-sm text-gray-600">
                Sélectionne 2+ séquences puis clique “Run”.
              </div>
            )}

            {compareResults.length > 0 && (
              <div className="overflow-auto max-h-[55vh]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Seq A</TableHead>
                      <TableHead>Seq B</TableHead>
                      <TableHead className="text-right">Identity %</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compareResults.map((r, i) => (
                      <TableRow key={i} className="hover:bg-gray-50">
                        <TableCell>{r.a.name} <span className="text-xs text-gray-500">#{r.a.id}</span></TableCell>
                        <TableCell>{r.b.name} <span className="text-xs text-gray-500">#{r.b.id}</span></TableCell>
                        <TableCell className="text-right">{r.identity.toFixed(2)}%</TableCell>
                        <TableCell className="text-right">{r.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Classify Modal */}
      {classifyOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-[900px] max-w-[95vw] relative border-0 shadow-md">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Batch Classify (UI)
                </h2>
                <p className="text-sm text-gray-600">
                  Heuristique simple (GC%, longueur). Si tu veux une vraie classification backend, on ajoute un endpoint.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={exportClassifyReport} disabled={!classifyRows.length}>
                  <Download className="w-4 h-4 mr-2" /> Export report
                </Button>
                <Button variant="ghost" onClick={() => setClassifyOpen(false)}>✕</Button>
              </div>
            </div>

            {!classifyRows.length ? (
              <div className="p-4 bg-gray-50 rounded text-sm text-gray-600">
                Sélectionne des séquences puis clique “Batch Classify”.
              </div>
            ) : (
              <div className="overflow-auto max-h-[55vh]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Length</TableHead>
                      <TableHead className="text-right">GC%</TableHead>
                      <TableHead>Predicted</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classifyRows.map((r) => (
                      <TableRow key={r.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm text-gray-600">{r.id}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell className="text-right">{r.length}</TableCell>
                        <TableCell className="text-right">{r.gc.toFixed(2)}%</TableCell>
                        <TableCell>{r.predicted}</TableCell>
                        <TableCell className="text-sm text-gray-600">{r.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
