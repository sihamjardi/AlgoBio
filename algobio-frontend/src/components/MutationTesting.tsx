import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  FlaskConical,
  Play,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
  Database,
} from "lucide-react";
import { Badge } from "./ui/badge";

// =====================
// API
// =====================
const API_BASE = "http://localhost:8088"; // gateway
// const API_BASE = "http://localhost:8083"; // direct mutation-service

type Alignment = {
  alignedSeq1: string;
  alignedSeq2: string;
  score: number;
  identityPercent: number;
};

type VariantResult = {
  mutatedSequence: string;
  alignment: Alignment;
};

type SimulateResponse = {
  originalSequence: string;
  variants: VariantResult[];
};

async function simulateMutation(payload: any) {
  const res = await fetch("/api/mutations/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// =====================
// UI helpers (impact look)
// =====================
const impactLevels = [
  {
    level: "Critical",
    color: "text-red-600",
    bgColor: "bg-red-50",
    description: "Severe functional impact predicted",
    min: 0,
    max: 40,
  },
  {
    level: "High",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Significant impact on protein structure",
    min: 40,
    max: 65,
  },
  {
    level: "Moderate",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    description: "Moderate effect on function",
    min: 65,
    max: 85,
  },
  {
    level: "Low",
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Minimal impact expected",
    min: 85,
    max: 101,
  },
];

function pickImpactFromIdentity(identityPercent: number) {
  // Plus l'identité est basse => impact plus sévère
  const lvl =
    impactLevels.find((x) => identityPercent >= x.min && identityPercent < x.max) ??
    impactLevels[2];

  // score sur 10: identité haute => score faible
  const score = Math.max(0, Math.min(10, +(10 - identityPercent / 10).toFixed(1)));
  return { ...lvl, score };
}

// =====================
// Component
// =====================
export function MutationTesting() {
  // Entrées user
  const [useSequenceId, setUseSequenceId] = useState(false);
  const [sequenceId, setSequenceId] = useState<number | "">("");
  const [originalSequence, setOriginalSequence] = useState("");

  const [mutationType, setMutationType] = useState<
    "SUBSTITUTION" | "INSERTION" | "DELETION"
  >("SUBSTITUTION");
  const [mutationRate, setMutationRate] = useState<number>(0.05);
  const [variants, setVariants] = useState<number>(5);
  const [alignmentAlgorithm, setAlignmentAlgorithm] = useState<
    "NEEDLEMAN_WUNSCH" | "BLAST_SIMPLIFIED"
  >("NEEDLEMAN_WUNSCH");

  // Résultats
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SimulateResponse | null>(null);

  const bestIdentity = useMemo(() => {
    if (!data?.variants?.length) return null;
    return Math.max(...data.variants.map((v) => v.alignment.identityPercent));
  }, [data]);

  const impact = useMemo(() => {
    if (bestIdentity == null) return null;
    return pickImpactFromIdentity(bestIdentity);
  }, [bestIdentity]);

  const canRun = useMemo(() => {
    if (loading) return false;
    if (useSequenceId) return sequenceId !== "" && Number(sequenceId) > 0;
    return originalSequence.replace(/\s/g, "").length >= 5;
  }, [loading, useSequenceId, sequenceId, originalSequence]);

  const runSimulation = async () => {
    setError(null);
    setData(null);

    const payload: any = {
      mutationType,
      mutationRate,
      variants,
      alignmentAlgorithm,
    };

    if (useSequenceId) payload.sequenceId = Number(sequenceId);
    else payload.originalSequence = originalSequence;

    try {
      setLoading(true);
      const res = await simulateMutation(payload);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <FlaskConical className="w-7 h-7 text-green-600" />
          Mutation Testing
        </h2>
        <p className="text-gray-600">
          Generates mutated variants (substitution / insertion / deletion) and compares the alignment with the original sequence.
        </p>
      </div>

      {/* Source selection */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h3 className="mb-1">Source de la séquence</h3>
            <p className="text-sm text-gray-600">
              You can either paste a sequence, or use an existing sequence via ID.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={useSequenceId ? "outline" : "default"}
              onClick={() => setUseSequenceId(false)}
            >
              Paste a sequence
            </Button>
            <Button
              variant={useSequenceId ? "default" : "outline"}
              onClick={() => setUseSequenceId(true)}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Sequence ID
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {useSequenceId ? (
            <div className="max-w-sm">
              <Label>sequenceId</Label>
              <Input
                type="number"
                min="1"
                placeholder="ex: 12"
                value={sequenceId}
                onChange={(e) => setSequenceId(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="original-seq">Original Sequence</Label>
              <Textarea
                id="original-seq"
                placeholder="Enter the original DNA sequence (A,T,C,G)..."
                value={originalSequence}
                onChange={(e) => setOriginalSequence(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Length: {originalSequence.replace(/\s/g, "").length} bp
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Parameters */}
      <Card className="p-6 border-0 shadow-md">
        <div className="mb-6">
          <h3 className="mb-1">Mutation parameters</h3>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs">Mutation Type</Label>
            <Select value={mutationType} onValueChange={(v: any) => setMutationType(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUBSTITUTION">Substitution</SelectItem>
                <SelectItem value="INSERTION">Insertion</SelectItem>
                <SelectItem value="DELETION">Deletion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Mutation Rate (0..1)</Label>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={mutationRate}
              onChange={(e) => setMutationRate(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Variants (1..50)</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={variants}
              onChange={(e) => setVariants(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Alignment Algorithm</Label>
            <Select
              value={alignmentAlgorithm}
              onValueChange={(v: any) => setAlignmentAlgorithm(v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEEDLEMAN_WUNSCH">Needleman–Wunsch</SelectItem>
                <SelectItem value="BLAST_SIMPLIFIED">BLAST (simplified)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button
            onClick={runSimulation}
            disabled={!canRun}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Simulation...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Simuler & Aligner (Backend)
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            <b>Erreur:</b> {error}
          </div>
        )}
      </Card>

      {/* Results */}
      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Impact score (style identique) */}
          {impact && (
            <Card className={`p-8 border-2 shadow-lg ${impact.bgColor} border-gray-200`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-6 h-6 ${impact.color}`} />
                    <h3 className="text-2xl">Impact Analysis Complete</h3>
                  </div>
                  <p className="text-gray-600">{impact.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Impact Level</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl ${impact.color}`}>{impact.level}</span>
                    <Badge className={impact.bgColor + " " + impact.color}>From identity%</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Impact Score</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl ${impact.color}`}>{impact.score}/10</span>
                    {impact.score > 7 ? (
                      <TrendingUp className="w-6 h-6 text-red-500" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Variants Generated</p>
                  <span className="text-3xl text-gray-700">{data.variants.length}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Original + variants */}
          <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="mb-4">Résultats Backend</h3>

            <div className="bg-white rounded-xl p-4 font-mono text-sm space-y-2">
              <div className="flex gap-4">
                <span className="text-gray-500 w-24">Original:</span>
                <span className="text-gray-700 break-all">
                  {data.originalSequence.substring(0, 120)}
                  {data.originalSequence.length > 120 ? "..." : ""}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {data.variants.map((v, idx) => (
                <Card key={idx} className="p-4 border-0 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">Variant {idx + 1}</Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Score: {v.alignment.score}</Badge>
                      <Badge
                        variant="outline"
                        className={
                          v.alignment.identityPercent >= 85
                            ? "text-green-600 border-green-300"
                            : v.alignment.identityPercent >= 65
                            ? "text-yellow-600 border-yellow-300"
                            : v.alignment.identityPercent >= 40
                            ? "text-orange-600 border-orange-300"
                            : "text-red-600 border-red-300"
                        }
                      >
                        Identity: {v.alignment.identityPercent.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Mutated sequence</div>
                      <div className="break-all">{v.mutatedSequence.substring(0, 240)}{v.mutatedSequence.length>240?"...":""}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Aligned original</div>
                        <div className="break-all">{v.alignment.alignedSeq1}</div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Aligned mutated</div>
                        <div className="break-all">{v.alignment.alignedSeq2}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Recommendations (garde ton style) */}
          <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-purple-50 to-blue-50">
            <h3 className="mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">1</span>
                </div>
                <div>
                  <p className="mb-1">Comparer les variantes</p>
                  <p className="text-sm text-gray-600">
                    Observe l’identité (%) et le score pour comprendre l’impact du taux de mutation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600">2</span>
                </div>
                <div>
                  <p className="mb-1">Changer d’algorithme</p>
                  <p className="text-sm text-gray-600">
                    Test Needleman–Wunsch vs BLAST simplifié pour voir la différence sur l’alignement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">3</span>
                </div>
                <div>
                  <p className="mb-1">Ajuster mutationRate</p>
                  <p className="text-sm text-gray-600">
                    0.01–0.10 = pédagogique et stable. Au-delà, l’identité chute vite (surtout insertion/délétion).
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
