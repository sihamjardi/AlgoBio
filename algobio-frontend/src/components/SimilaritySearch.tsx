import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Microscope, Search, Filter, Eye, GitCompare, Download, ChevronDown } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

const mockResults = [
  { id: "NM_007294.3", name: "BRCA1 (Homo sapiens)", similarity: 98.5, length: 5592, organism: "Human", type: "DNA", eValue: "0.0" },
  { id: "NM_000059.3", name: "BRCA2 (Homo sapiens)", similarity: 76.2, length: 10257, organism: "Human", type: "DNA", eValue: "2e-145" },
  { id: "XM_015278891.2", name: "BRCA1 (Mus musculus)", similarity: 82.1, length: 5634, organism: "Mouse", type: "DNA", eValue: "1e-178" },
  { id: "NM_001014432.1", name: "BRCA1 (Rattus norvegicus)", similarity: 81.3, length: 5598, organism: "Rat", type: "DNA", eValue: "3e-176" },
  { id: "XM_005244872.4", name: "BRCA1 (Canis lupus)", similarity: 79.8, length: 5601, organism: "Dog", type: "DNA", eValue: "8e-171" },
  { id: "NM_001097565.2", name: "BRCA1 (Bos taurus)", similarity: 78.5, length: 5607, organism: "Cow", type: "DNA", eValue: "2e-168" },
];

export function SimilaritySearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [database, setDatabase] = useState("nr");
  const [sortBy, setSortBy] = useState("similarity");

  const performSearch = () => {
    setShowResults(true);
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return "text-green-600 bg-green-50";
    if (similarity >= 75) return "text-blue-600 bg-blue-50";
    if (similarity >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2 flex items-center gap-2">
          <Microscope className="w-7 h-7 text-cyan-600" />
          Similarity Search (BLAST)
        </h2>
        <p className="text-gray-600">Search for similar sequences in biological databases</p>
      </div>

      {/* Search Interface */}
      <Card className="p-6 border-0 shadow-md">
        <div className="space-y-4">
          {/* Database Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">Database</label>
              <Select value={database} onValueChange={setDatabase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Select defaultValue="blastn">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Select defaultValue="100">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Enter sequence or accession number to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={performSearch}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Microscope className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Advanced Options */}
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Options
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Search Results */}
      {showResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Results Summary */}
          <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-cyan-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">Search Complete</h3>
                <p className="text-sm text-gray-600">Found {mockResults.length} similar sequences</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Query Length</p>
                  <p className="text-lg">5592 bp</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Database</p>
                  <p className="text-lg">{database.toUpperCase()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Search Time</p>
                  <p className="text-lg">3.2s</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Filters and Sort */}
          <Card className="p-4 border-0 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Filter by:</span>
                </div>
                <Button variant="outline" size="sm">
                  Organism
                </Button>
                <Button variant="outline" size="sm">
                  Type
                </Button>
                <Button variant="outline" size="sm">
                  Similarity &gt; 80%
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="similarity">Similarity</SelectItem>
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
                    <TableHead>Similarity</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>E-value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockResults.map((result) => (
                    <TableRow key={result.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono text-sm">{result.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="mb-1">{result.name}</p>
                          <Badge variant="outline" className="text-xs">{result.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{result.organism}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-sm ${getSimilarityColor(result.similarity)}`}>
                              {result.similarity}%
                            </span>
                          </div>
                          <Progress value={result.similarity} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{result.length} bp</TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">{result.eValue}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <GitCompare className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
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
          <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="mb-1">Top Match Details</h3>
                <p className="text-sm text-gray-600">{mockResults[0].id} - {mockResults[0].name}</p>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Best Hit
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Identity</p>
                <p className="text-lg text-green-600">{mockResults[0].similarity}%</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Query Cover</p>
                <p className="text-lg text-blue-600">96%</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">E-value</p>
                <p className="text-lg text-purple-600">{mockResults[0].eValue}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Bit Score</p>
                <p className="text-lg text-cyan-600">1024</p>
              </div>
            </div>

            {/* Alignment Preview */}
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <div className="font-mono text-xs space-y-1">
                <div className="text-gray-500">Query: 1    <span className="text-green-400">ATGGCTAGCTAGCTGATCGATCGATCGATCGATCGATCGATCGATCGAT</span> 50</div>
                <div className="text-gray-500">            <span className="text-yellow-400">||||||||||||||||||||||||||||||||||||||||||||||||||</span></div>
                <div className="text-gray-500">Sbjct: 1    <span className="text-green-400">ATGGCTAGCTAGCTGATCGATCGATCGATCGATCGATCGATCGATCGAT</span> 50</div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Full Alignment
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
              <Button variant="outline" size="sm">
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Selected
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
