import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Sparkles, Upload, Brain, CheckCircle2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

type TopK = { label: string; prob: number };

type PredictResponse = {
  label_type: string;
  prediction: string;
  prob: number;
  top_k: TopK[];
  reason?: string;
};

export function AIClassification() {
  const [sequence, setSequence] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      if (!res.ok) {
        // FastAPI renvoie {"detail": "..."}
        setError(data?.detail ?? "Erreur API");
      } else {
        setResult(data as PredictResponse);
      }
    } catch (e: any) {
      setError("Impossible de contacter le serveur FastAPI (vérifie qu’il tourne sur 127.0.0.1:8000).");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dnaLen = sequence.replace(/\s/g, "").length;

  const confidencePct = result ? Math.round(result.prob * 1000) / 10 : 0; // ex: 0.199 -> 19.9%

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-600" /> AI Classification
        </h2>
        <p className="text-gray-600">Classification ADN (famille virale) via ton microservice FastAPI</p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-0 shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>Input Sequence</h3>
              <Button variant="outline" size="sm" disabled>
                <Upload className="w-3 h-3 mr-2" /> Upload File (optionnel)
              </Button>
            </div>

            <Textarea
              placeholder="Colle ta séquence ADN ici..."
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Length: {dnaLen} caractères</p>

              <Button
                onClick={performClassification}
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

        {/* Info Card (tu peux garder la tienne, ici version simple) */}
        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-600">API</p>
              <p className="font-mono">POST /predict</p>
            </div>
            <div>
              <p className="text-gray-600">Dataset</p>
              <p className="font-mono">DNA-LLM/virus_detailed_clean</p>
            </div>
            <div>
              <p className="text-gray-600">Min length</p>
              <p className="font-mono">{/* juste info UI */}meta.pkl</p>
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
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl">
                        <div className="font-mono">{x.label}</div>
                        <div className="flex items-center gap-3">
                          <Progress value={Math.min(100, pct)} className="w-28 h-2" />
                          <div className="w-14 text-right text-sm text-gray-600">{pct}%</div>
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
