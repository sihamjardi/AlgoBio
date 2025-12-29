import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Microscope,
  Search,
  Filter,
  Eye,
  GitCompare,
  Download,
  ChevronDown,
  BarChart3,
  Clock,
  Database,
  Target,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type BlastResult = {
  id: string;
  name: string;
  organism: string;
  type: "DNA" | "Protein";
  length: number;
  identity: number; // %
  queryCover: number; // %
  eValue: string;
  bitScore: number;
};

const STATIC_RESULTS: BlastResult[] = [
  {
    id: "NM_007294.3",
    name: "BRCA1 transcript variant 1",
    organism: "Homo sapiens",
    type: "DNA",
    length: 5592,
    identity: 98.5,
    queryCover: 96,
    eValue: "0.0",
    bitScore: 1024,
  },
  {
    id: "NM_000059.4",
    name: "BRCA2 transcript variant 2",
    organism: "Homo sapiens",
    type: "DNA",
    length: 10257,
    identity: 76.2,
    queryCover: 81,
    eValue: "2e-145",
    bitScore: 611,
  },
  {
    id: "XM_015278891.2",
    name: "Brca1 predicted transcript",
    organism: "Mus musculus",
    type: "DNA",
    length: 5634,
    identity: 82.1,
    queryCover: 88,
    eValue: "1e-178",
    bitScore: 742,
  },
  {
    id: "NM_001014432.1",
    name: "Brca1 mRNA",
    organism: "Rattus norvegicus",
    type: "DNA",
    length: 5598,
    identity: 81.3,
    queryCover: 86,
    eValue: "3e-176",
    bitScore: 731,
  },
  {
    id: "XM_005244872.4",
    name: "BRCA1-like predicted transcript",
    organism: "Canis lupus familiaris",
    type: "DNA",
    length: 5601,
    identity: 79.8,
    queryCover: 84,
    eValue: "8e-171",
    bitScore: 705,
  },
  {
    id: "NM_001097565.2",
    name: "Brca1 mRNA",
    organism: "Bos taurus",
    type: "DNA",
    length: 5607,
    identity: 78.5,
    queryCover: 83,
    eValue: "2e-168",
    bitScore: 694,
  },
];

const STATIC_ALIGNMENT_PREVIEW = {
  queryLen: 5592,
  db: "NR",
  program: "blastn",
  maxResults: 100,
  durationSec: 3.2,
  queryLabel: "Query_001 (BRCA-like fragment)",
  notes:
    "Static demo dataset for UI/UX — not a real BLAST. Values are plausible for visualization.",
};

export function SimilaritySearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [database, setDatabase] = useState("nr");
  const [sortBy, setSortBy] = useState("bitScore");
  const [selectedOrg, setSelectedOrg] = useState<"all" | string>("all");

  const performSearch = () => {
    setShowResults(true);
  };

  const getSimilarityColor = (identity: number) => {
    if (identity >= 90) return "text-green-700 bg-green-50";
    if (identity >= 75) return "text-blue-700 bg-blue-50";
    if (identity >= 60) return "text-yellow-700 bg-yellow-50";
    return "text-orange-700 bg-orange-50";
  };

  const filteredAndSorted = useMemo(() => {
    let rows = [...STATIC_RESULTS];

    if (selectedOrg !== "all") {
      rows = rows.filter((r) => r.organism === selectedOrg);
    }

    rows.sort((a, b) => {
      if (sortBy === "identity") return b.identity - a.identity;
      if (sortBy === "evalue") return a.eValue.localeCompare(b.eValue); // cheap sort for demo
      if (sortBy === "length") return b.length - a.length;
      return b.bitScore - a.bitScore; // default
    });

    return rows;
  }, [sortBy, selectedOrg]);

  const summary = useMemo(() => {
    const rows = filteredAndSorted;
    if (!rows.length) {
      return {
        topHit: null as BlastResult | null,
        avgIdentity: 0,
        avgCover: 0,
        bestBitScore: 0,
      };
    }
    const topHit = rows[0];
    const avgIdentity = rows.reduce((s, r) => s + r.identity, 0) / rows.length;
    const avgCover = rows.reduce((s, r) => s + r.queryCover, 0) / rows.length;
    const bestBitScore = Math.max(...rows.map((r) => r.bitScore));
    return { topHit, avgIdentity, avgCover, bestBitScore };
  }, [filteredAndSorted]);

  const identityBars = useMemo(() => {
    return filteredAndSorted.map((r) => ({
      label: r.id.replace(/\..*$/, ""),
      identity: r.identity,
      cover: r.queryCover,
    }));
  }, [filteredAndSorted]);

  const organismPie = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filteredAndSorted) map.set(r.organism, (map.get(r.organism) ?? 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredAndSorted]);

  const uniqueOrganisms = useMemo(() => {
    return Array.from(new Set(STATIC_RESULTS.map((r) => r.organism)));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <Microscope className="w-7 h-7 text-cyan-600" /> Similarity Search (BLAST)
        </h2>
        <p className="text-gray-600">
          Static demo UI (no real search) — realistic-looking results for design & visualization.
        </p>
      </div>

      {/* Search Interface */}
      <Card className="p-6 border-0 shadow-md">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">Database</label>
              <Select value={database} onValueChange={setDatabase}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nr">Non-redundant (nr)</SelectItem>
                  <SelectItem value="refseq">RefSeq</SelectItem>
                  <SelectItem value="pdb">PDB</SelectItem>
                  <SelectItem value="swissprot">SwissProt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Program</label>
              <Select defaultValue={STATIC_ALIGNMENT_PREVIEW.program}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blastn">BLASTn (nucleotide)</SelectItem>
                  <SelectItem value="blastp">BLASTp (protein)</SelectItem>
                  <SelectItem value="blastx">BLASTx</SelectItem>
                  <SelectItem value="tblastn">tBLASTn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Max Results</label>
              <Select defaultValue={String(STATIC_ALIGNMENT_PREVIEW.maxResults)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Enter sequence or accession number (demo)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={performSearch}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Microscope className="w-4 h-4 mr-2" /> Search
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-600">
            <Filter className="w-4 h-4 mr-2" /> Advanced Options <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Results */}
      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary / KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-0 shadow-md bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                    <Database className="w-4 h-4" /> Database
                  </p>
                  <p className="text-lg">{database.toUpperCase()}</p>
                </div>
                <Badge variant="outline">Static</Badge>
              </div>
            </Card>

            <Card className="p-5 border-0 shadow-md">
              <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                <Target className="w-4 h-4" /> Avg Identity
              </p>
              <p className="text-2xl">{summary.avgIdentity.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Across {filteredAndSorted.length} hits</p>
            </Card>

            <Card className="p-5 border-0 shadow-md">
              <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Best Bit Score
              </p>
              <p className="text-2xl">{summary.bestBitScore}</p>
              <p className="text-xs text-gray-500 mt-1">Top scoring match</p>
            </Card>

            <Card className="p-5 border-0 shadow-md">
              <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Search Time
              </p>
              <p className="text-2xl">{STATIC_ALIGNMENT_PREVIEW.durationSec}s</p>
              <p className="text-xs text-gray-500 mt-1">Demo runtime</p>
            </Card>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 border-0 shadow-md lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="mb-1">Identity & Coverage by Hit</h3>
                  <p className="text-sm text-gray-500">Static values to validate chart design</p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={identityBars}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="identity" />
                  <Bar dataKey="cover" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2">
                identity = % identity, cover = % query coverage
              </p>
            </Card>

            <Card className="p-6 border-0 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="mb-1">Organism Distribution</h3>
                  <p className="text-sm text-gray-500">Hits per organism</p>
                </div>
                <Filter className="w-5 h-5 text-gray-400" />
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={organismPie} dataKey="value" nameKey="name" outerRadius={90} label />
                  {/* no custom colors to keep it simple */}
                  {organismPie.map((_, idx) => (
                    <Cell key={idx} />
                  ))}
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Filters and Sort (static controls but they work locally) */}
          <Card className="p-4 border-0 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" /> Filter:
                </span>

                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Organism" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All organisms</SelectItem>
                    {uniqueOrganisms.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Badge variant="outline" className="text-xs">Demo filter</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitScore">Bit Score</SelectItem>
                    <SelectItem value="identity">Identity</SelectItem>
                    <SelectItem value="evalue">E-value</SelectItem>
                    <SelectItem value="length">Length</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Results Table */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Accession</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Organism</TableHead>
                    <TableHead>Identity</TableHead>
                    <TableHead>Cover</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>E-value</TableHead>
                    <TableHead>Bit Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.map((r) => (
                    <TableRow key={r.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono text-sm">{r.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="mb-1">{r.name}</p>
                          <Badge variant="outline" className="text-xs">{r.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{r.organism}</TableCell>

                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm ${getSimilarityColor(r.identity)}`}>
                          {r.identity}%
                        </span>
                        <Progress value={r.identity} className="h-1.5 mt-2" />
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-gray-700">{r.queryCover}%</span>
                        <Progress value={r.queryCover} className="h-1.5 mt-2" />
                      </TableCell>

                      <TableCell className="text-gray-600">{r.length} bp</TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">{r.eValue}</TableCell>
                      <TableCell className="font-mono text-sm text-gray-700">{r.bitScore}</TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Compare">
                            <GitCompare className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Download">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Top Match Details */}
          {summary.topHit && (
            <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="mb-1">Top Match Details</h3>
                  <p className="text-sm text-gray-600">
                    {summary.topHit.id} — {summary.topHit.name}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Best Hit</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Identity</p>
                  <p className="text-lg">{summary.topHit.identity}%</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Query Cover</p>
                  <p className="text-lg">{summary.topHit.queryCover}%</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">E-value</p>
                  <p className="text-lg font-mono">{summary.topHit.eValue}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Bit Score</p>
                  <p className="text-lg">{summary.topHit.bitScore}</p>
                </div>
              </div>

              {/* Alignment Preview (static) */}
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <div className="font-mono text-xs space-y-1">
                  <div className="text-gray-400">
                    {STATIC_ALIGNMENT_PREVIEW.queryLabel} (len {STATIC_ALIGNMENT_PREVIEW.queryLen} bp)
                  </div>
                  <div className="text-gray-500">
                    Query: 1{" "}
                    <span className="text-green-400">
                      ATGGCTAGCTAGCTGATCGATCGATCGATCGATCGATCGATCGATCGAT
                    </span>{" "}
                    50
                  </div>
                  <div className="text-gray-500">
                    {" "}
                    <span className="text-yellow-400">
                      ||||||||||||||||||||||||||||||||||||||||||||||||||
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Sbjct: 1{" "}
                    <span className="text-green-400">
                      ATGGCTAGCTAGCTGATCGATCGATCGATCGATCGATCGATCGATCGAT
                    </span>{" "}
                    50
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 flex-wrap">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" /> View Full Alignment
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" /> Export Results
                </Button>
                <Button variant="outline" size="sm">
                  <GitCompare className="w-4 h-4 mr-2" /> Compare Selected
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4">{STATIC_ALIGNMENT_PREVIEW.notes}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
