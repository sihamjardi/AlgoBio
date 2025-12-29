import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Sparkles, Upload, Brain, CheckCircle2 } from "lucide-react";

type TopK = { label: string; prob: number };
type PredictResponse = {
  label_type: string;
  prediction: string;
  prob: number;
  top_k: TopK[];
  reason?: string;
};

// ==== Types / Helpers History ====
type Seq = {
  id: number | string;
  name?: string;
  length?: number;
  createdAt?: string;
  classification?: string;
  sequence?: string;
  seq?: string;
  dna?: string;
  content?: string;
};

const clean = (s: string) => s.replace(/\s/g, "").toUpperCase();
const getSeqString = (s: Seq) =>
  (s.sequence ?? s.seq ?? s.dna ?? s.content ?? "").toString();

function HistoryPicker({
  title,
  onPick,
}: {
  title: string;
  onPick: (dna: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Seq[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);


        const r = await fetch("/api/sequences");
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setHistory(list);
      } catch (e: any) {
        setHistory([]);
        setErr(e?.message || "Erreur fetch history");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return history;
    return history.filter((s) => {
      const name = (s.name ?? "").toLowerCase();
      const id = String(s.id ?? "");
      const cls = (s.classification ?? "").toLowerCase();
      return name.includes(qq) || id.includes(qq) || cls.includes(qq);
    });
  }, [history, q]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Upload className="w-3 h-3 mr-2" /> Import from History
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Search by name / id / classification..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {loading && <div className="text-sm text-gray-600 mt-2">Loading...</div>}
        {err && <div className="text-sm text-red-600 mt-2">Erreur: {err}</div>}

        <div className="max-h-[360px] overflow-auto border rounded mt-3">
          {!loading &&
            filtered.map((s) => {
              const dna = getSeqString(s);
              return (
                <button
                  key={String(s.id)}
                  type="button"
                  onClick={() => {
                    if (!dna) {
                      setErr(
                        "Cette entrée n'a pas de champ sequence dans la réponse backend (ajoute-le ou fais un endpoint GET /api/sequences/{id})."
                      );
                      return;
                    }
                    onPick(dna);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {s.name ?? "Unnamed"}{" "}
                      <span className="text-xs text-gray-500">#{s.id}</span>
                    </div>
                    <div className="text-xs text-gray-500">{s.length ?? "—"} bp</div>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {dna ? dna.slice(0, 120) : "(no sequence field)"}
                  </div>
                </button>
              );
            })}

          {!loading && filtered.length === 0 && (
            <div className="p-3 text-sm text-gray-500">No sequences found.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AIClassification() {
  const [sequence, setSequence] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const performClassification = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequence,
          top_k: 5,
          min_prob: 0.05,
        }),
      });

      const data = await res.json();
      if (!res.ok) setError(data?.detail ?? "Erreur API");
      else setResult(data as PredictResponse);
    } catch {
      setError(
        "Impossible de contacter le serveur FastAPI (vérifie qu’il tourne sur 127.0.0.1:8000)."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dnaLen = clean(sequence).length;
  const confidencePct = result ? Math.round(result.prob * 1000) / 10 : 0;

  // ==== Upload File handler ====
  const onPickFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();

    // FASTA: enlever les headers ">"
    const lines = text
      .split(/\r?\n/)
      .filter((l) => !l.trim().startsWith(">"))
      .join("");

    setSequence(lines);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-600" /> AI Classification
        </h2>
        <p className="text-gray-600">
          Classification ADN (famille virale)
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-0 shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>Input Sequence</h3>

              <div className="flex gap-2">
                {/* Import from History */}
                <HistoryPicker
                  title="Import sequence from History"
                  onPick={(dna) => setSequence(dna)}
                />

                {/* Upload File */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.fasta,.fa,.fna"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-2" /> Upload File
                </Button>
              </div>
            </div>

            <Textarea
              placeholder="Paste the sequence..."
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Length: {dnaLen} caractères</p>

              <Button
                type="button"
                onClick={(e) => { e.preventDefault(); performClassification(); }}
                disabled={!sequence || isAnalyzing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Classify Sequence
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">About this AI</p>
              <p className="text-gray-800">
                This module automatically classifies viral DNA sequences into their
                biological family using a machine learning model trained on curated
                viral genomes.
              </p>
            </div>

            <div>
              <p className="text-gray-600">How it works</p>
              <p className="text-gray-800">
                The sequence is transformed into k‑mer features and analyzed by a
                probabilistic classifier to predict the most likely viral family.
              </p>
            </div>

            <div>
              <p className="text-gray-600">Model & Data</p>
              <p className="font-mono text-xs">
                Dataset: DNA‑LLM / virus_detailed_clean<br/>
                Output: Virus family + Top‑K probabilities
              </p>
            </div>
          </div>
        </Card>

      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-8 border-2 shadow-lg border-purple-200 bg-purple-50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
              <h3 className="text-2xl">Classification Complete</h3>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-600 mb-2">Predicted Class (family)</p>
                <div className="text-3xl text-purple-700 flex items-center gap-3">
                  {result.prediction}
                  {result.reason === "low_confidence" && (
                    <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Low confidence
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Confidence</p>
                  <span className="text-xl">{confidencePct}%</span>
                </div>
                <Progress value={Math.min(100, confidencePct)} className="h-3" />
              </div>

              <div className="pt-4 border-t border-purple-200">
                <h4 className="mb-3">Top-K</h4>
                <div className="space-y-2">
                  {result.top_k.map((x, i) => {
                    const pct = Math.round(x.prob * 1000) / 10;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-white rounded-xl"
                      >
                        <div className="font-mono">{x.label}</div>
                        <div className="flex items-center gap-3">
                          <Progress value={Math.min(100, pct)} className="w-28 h-2" />
                          <div className="w-14 text-right text-sm text-gray-600">
                            {pct}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
