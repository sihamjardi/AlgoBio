import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Dna, Save, Sparkles, GitCompare, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Badge } from "./ui/badge";
import { saveSequence } from "../services/api";


export function SequenceInput() {
  const [sequence, setSequence] = useState("");
  const [sequenceName, setSequenceName] = useState("");
  const [validationStatus, setValidationStatus] = useState<"valid" | "invalid" | "none">("none");

  const validateSequence = (seq: string) => {
    const cleanSeq = seq.replace(/\s/g, "").toUpperCase();
    
    if (cleanSeq.length === 0) {
      setValidationStatus("none");
      return;
    }

    // DNA validation only
    const validChars = /^[ATCG]+$/;
    setValidationStatus(validChars.test(cleanSeq) ? "valid" : "invalid");
  };

const handleSaveSequence = async () => {
    const cleanSeq = sequence.replace(/\s/g, "").toUpperCase();

    const payload = {
      name: sequenceName,
      sequence: cleanSeq
    };

    try {
        const res = await fetch("http://localhost:8088/api/sequences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const msg = await res.text();
            alert("Erreur backend : " + msg);
            return;
        }

        const data = await res.json();
        console.log("Saved !", data);
        alert("Sequence saved successfully!");

    } catch (error) {
        console.error(error);
        alert("Erreur réseau !");
    }
};



  const handleSequenceChange = (value: string) => {
    setSequence(value);
    validateSequence(value);
  };

  const getValidationColor = () => {
    if (validationStatus === "valid") return "border-green-400 bg-green-50";
    if (validationStatus === "invalid") return "border-red-400 bg-red-50";
    return "border-gray-200";
  };

  const getSequenceStats = () => {
    const cleanSeq = sequence.replace(/\s/g, "").toUpperCase();
    const length = cleanSeq.length;
    
    if (length === 0) return null;

    // Calculate GC content
    const gCount = (cleanSeq.match(/G/g) || []).length;
    const cCount = (cleanSeq.match(/C/g) || []).length;
    const gc = ((gCount + cCount) / length) * 100;

    // Calculate AT content
    const aCount = (cleanSeq.match(/A/g) || []).length;
    const tCount = (cleanSeq.match(/T/g) || []).length;
    const at = ((aCount + tCount) / length) * 100;

    return { length, gc, at, aCount, tCount, gCount, cCount };
  };

  const stats = getSequenceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <Dna className="w-7 h-7 text-blue-600" />
          Enter DNA Sequence
        </h2>
        <p className="text-gray-600">Input and validate your DNA sequence for analysis</p>
      </div>

      {/* Main Input Card */}
      <Card className="p-6 border-0 shadow-md">
        <div className="space-y-6">
          {/* Sequence Name */}
          <div>
            <Label htmlFor="sequence-name">Sequence Name</Label>
            <Input
              id="sequence-name"
              placeholder="e.g., BRCA1_Human_Exon5"
              value={sequenceName}
              onChange={(e) => setSequenceName(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Sequence Input Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="sequence-input">DNA Sequence</Label>
              {validationStatus !== "none" && (
                <div className="flex items-center gap-2">
                  {validationStatus === "valid" ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Valid DNA sequence
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Invalid characters detected
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Textarea
              id="sequence-input"
              placeholder="Paste your DNA sequence here..."
              value={sequence}
              onChange={(e) => handleSequenceChange(e.target.value)}
              className={`min-h-[300px] font-mono text-sm ${getValidationColor()} transition-colors`}
            />
          </div>

          {/* Sequence Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-600 mb-1">Length</p>
                <p className="text-lg text-blue-600">{stats.length} bp</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">GC Content</p>
                <p className="text-lg text-purple-600">{stats.gc.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">AT Content</p>
                <p className="text-lg text-cyan-600">{stats.at.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <p className={`text-lg ${validationStatus === "valid" ? "text-green-600" : "text-gray-400"}`}>
                  {validationStatus === "valid" ? "Ready" : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Base Composition */}
          {stats && (
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">Adenine (A)</p>
                <p className="text-xl text-blue-600">{stats.aCount}</p>
                <p className="text-xs text-gray-500">{((stats.aCount / stats.length) * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">Thymine (T)</p>
                <p className="text-xl text-red-600">{stats.tCount}</p>
                <p className="text-xs text-gray-500">{((stats.tCount / stats.length) * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">Guanine (G)</p>
                <p className="text-xl text-yellow-600">{stats.gCount}</p>
                <p className="text-xs text-gray-500">{((stats.gCount / stats.length) * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-gray-600 mb-1">Cytosine (C)</p>
                <p className="text-xl text-green-600">{stats.cCount}</p>
                <p className="text-xs text-gray-500">{((stats.cCount / stats.length) * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="mb-1">Valid DNA characters: A, T, C, G</p>
              <p className="text-xs">Enter nucleotide sequences using standard IUPAC codes. Spaces and line breaks will be ignored.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleSaveSequence}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={validationStatus !== "valid" || sequenceName.trim() === ""}>
              <Save className="w-4 h-4 mr-2" />
              Save Sequence
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              disabled={validationStatus !== "valid"}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze
            </Button>
            
          </div>
        </div>
      </Card>

      {/* Quick Templates */}
      <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-gray-50 to-blue-50">
        <h3 className="mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={() => {
              setSequence("ATGGCTAGCTAGCTGATCGATCGATCGATCGATCG");
              validateSequence("ATGGCTAGCTAGCTGATCGATCGATCGATCGATCG");
            }}
            className="p-3 text-left rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-white transition-all"
          >
            <p className="text-sm mb-1">Short Genomic DNA</p>
            <p className="text-xs text-gray-500">35 base pairs</p>
          </button>
          <button 
            onClick={() => {
              setSequence("ATGAAACGCATTAGCACCACCATTACCACCACCATCACCATTACCACAGGTAACGGTGCGGGCTGA");
              validateSequence("ATGAAACGCATTAGCACCACCATTACCACCACCATCACCATTACCACAGGTAACGGTGCGGGCTGA");
            }}
            className="p-3 text-left rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-white transition-all"
          >
            <p className="text-sm mb-1">Protein Coding Gene</p>
            <p className="text-xs text-gray-500">With start/stop codons</p>
          </button>
          <button 
            onClick={() => {
              setSequence("GCGCGCTAGCTAGCTAGCATGCATGCATGCTAGCTAGCTAGCGCGCGCATATATATGCGCGCTAGCTAGCTAGC");
              validateSequence("GCGCGCTAGCTAGCTAGCATGCATGCATGCTAGCTAGCTAGCGCGCGCATATATATGCGCGCTAGCTAGCTAGC");
            }}
            className="p-3 text-left rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-white transition-all"
          >
            <p className="text-sm mb-1">Regulatory Region</p>
            <p className="text-xs text-gray-500">High GC content</p>
          </button>
        </div>
      </Card>
    </div>


  );
}