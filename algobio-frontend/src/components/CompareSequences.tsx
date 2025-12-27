import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  GitCompare,
  Upload,
  ArrowLeftRight,
  Percent,
  CheckCircle2,
} from "lucide-react";

type Algo = "NEEDLEMAN_WUNSCH" | "BLAST_SIMPLIFIED";
type AlignResult = {
  alignedSeq1: string;
  alignedSeq2: string;
  score: number;
  identityPercent: number;
};
type Seq = {
  id: number | string;
  name?: string;
  length?: number;
  createdAt?: string;
  classification?: string;

  // champs possibles selon backend
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

export function CompareSequences() {
  const [algorithm, setAlgorithm] = useState<Algo>("NEEDLEMAN_WUNSCH");
  const [result, setResult] = useState<AlignResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sequence1, setSequence1] = useState("");
  const [sequence2, setSequence2] = useState("");
  const [loading, setLoading] = useState(false);

  const aligned1 = result?.alignedSeq1 ?? "";
  const aligned2 = result?.alignedSeq2 ?? "";

  const matches = useMemo(() => {
    if (!aligned1 || !aligned2) return "";
    let out = "";
    for (let i = 0; i < Math.min(aligned1.length, aligned2.length); i++) {
      out += aligned1[i] === aligned2[i] ? "|" : " ";
    }
    return out;
  }, [aligned1, aligned2]);

  const matchCount = useMemo(
    () => (matches ? matches.split("|").length - 1 : 0),
    [matches]
  );
  const mismatchCount = useMemo(() => {
    if (!aligned1 || !aligned2) return 0;
    return Math.min(aligned1.length, aligned2.length) - matchCount;
  }, [aligned1, aligned2, matchCount]);

  const similarity = result ? Math.round(result.identityPercent) : 0;

  const performAlignment = async () => {
    try {
      setError(null);
      setResult(null);
      setLoading(true);

      const payload = { seq1: clean(sequence1), seq2: clean(sequence2), algorithm };

      const res = await fetch("/api/alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      setResult((await res.json()) as AlignResult);
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <GitCompare className="w-7 h-7 text-purple-600" /> Compare Sequences
        </h2>
        <p className="text-gray-600">
          Perform pairwise sequence alignment and similarity analysis
        </p>
      </div>

      <div className="flex justify-center">
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as Algo)}
          className="
                bg-white
                border border-gray-200
                rounded-lg
                px-4 py-2
                text-sm
                shadow-sm
                hover:shadow-md
                focus:outline-none
                focus:ring-2 focus:ring-purple-400
                focus:border-purple-400
                transition
              "
        >
          <option value="NEEDLEMAN_WUNSCH">Needleman–Wunsch (Global)</option>
          <option value="BLAST_SIMPLIFIED">BLAST simplifié (Local)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="seq1">Sequence 1</Label>
              <HistoryPicker
                title="Import for Sequence 1"
                onPick={(dna) => setSequence1(dna)}
              />
            </div>

            <Textarea
              id="seq1"
              placeholder="Enter first sequence..."
              value={sequence1}
              onChange={(e) => setSequence1(e.target.value)}
              className="min-h-[250px] font-mono text-sm"
            />

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Length: {clean(sequence1).length} bp</span>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                DNA
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="seq2">Sequence 2</Label>
              <HistoryPicker
                title="Import for Sequence 2"
                onPick={(dna) => setSequence2(dna)}
              />
            </div>

            <Textarea
              id="seq2"
              placeholder="Enter second sequence..."
              value={sequence2}
              onChange={(e) => setSequence2(e.target.value)}
              className="min-h-[250px] font-mono text-sm"
            />

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Length: {clean(sequence2).length} bp</span>
              <Badge
                variant="outline"
                className="text-purple-600 border-purple-200"
              >
                DNA
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          size="lg"
          onClick={performAlignment}
          disabled={!clean(sequence1) || !clean(sequence2) || loading}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <ArrowLeftRight className="w-5 h-5 mr-2" />
          {loading ? "Aligning..." : "Perform Alignment"}
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-0 shadow-md bg-red-50 text-red-700">
          {error}
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="mb-1">Similarity Score</h3>
                <p className="text-sm text-gray-600">Based on sequence alignment</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>

            <div className="flex items-end gap-4 mb-4">
              <div className="text-5xl text-green-600">{similarity}%</div>
              <div className="pb-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <Percent className="w-3 h-3 mr-1" /> Identity
                </Badge>
              </div>
            </div>

            <Progress value={similarity} className="h-3 bg-green-100" />
            <div className="text-sm text-gray-700 mt-3">
              Score: <b>{result.score}</b>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-md">
            <h3 className="mb-4">Sequence Alignment</h3>
            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
              <div className="font-mono text-xs space-y-1">
                <div className="flex gap-4">
                  <span className="text-gray-500 w-16">Seq1:</span>
                  <div className="flex-1">
                    {aligned1.split("").map((ch, i) => (
                      <span
                        key={i}
                        className={matches[i] === "|" ? "text-green-400" : "text-gray-400"}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="text-gray-500 w-16"></span>
                  <div className="flex-1 text-yellow-400">{matches}</div>
                </div>

                <div className="flex gap-4">
                  <span className="text-gray-500 w-16">Seq2:</span>
                  <div className="flex-1">
                    {aligned2.split("").map((ch, i) => (
                      <span
                        key={i}
                        className={matches[i] === "|" ? "text-green-400" : "text-gray-400"}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Matches</p>
                <p className="text-xl text-blue-600">{matchCount}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Mismatches</p>
                <p className="text-xl text-purple-600">{mismatchCount}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Identity</p>
                <p className="text-xl text-green-600">{similarity}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
