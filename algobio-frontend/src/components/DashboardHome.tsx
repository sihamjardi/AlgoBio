import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Activity, Database, GitCompare, FlaskConical, TrendingUp, Clock,
  Dna, Microscope, Sparkles
} from "lucide-react";

import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

type Sequence = { id: number; createdAt?: string };
type Classification = {
  id: number;
  prediction: string;
  prob: number;
  created_at: string;
};

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const [seqCount, setSeqCount] = useState<number>(0);
  const [clsCount, setClsCount] = useState<number>(0);

   const [mutCount, setMutCount] = useState<number>(0);
   const [alignCount, setAlignCount] = useState(0);



  const [predictionData, setPredictionData] = useState<{ name: string; value: number }[]>([]);

  const [sequenceData, setSequenceData] = useState<{ month: string; sequences: number }[]>([]);
  const [analysisData, setAnalysisData] = useState<{ day: string; classifications: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Helpers pour group by mois/semaine (simple côté front)
  const monthKey = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", { month: "short" }); // Jan, Feb...
  };
  const weekKey = (iso: string) => {
    const d = new Date(iso);
    const w = Math.ceil(d.getDate() / 7);
    return `W${w}`;
  };

  const dayKey = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  };


  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // 1) Sequences (Spring)
        const seqRes = await fetch("/api/sequences");
        if (!seqRes.ok) throw new Error(await seqRes.text());
        const sequences: any[] = await seqRes.json();
        setSeqCount(sequences.length);

        // 2) Classifications (FastAPI) -> soit direct, soit via gateway si tu l’as routé
        const clsRes = await fetch("http://127.0.0.1:8000/classifications?limit=500");
        if (!clsRes.ok) throw new Error(await clsRes.text());
        const cls: Classification[] = await clsRes.json();
        setClsCount(cls.length);

        const mutRes = await fetch("/api/mutations/stats");
        if (!mutRes.ok) throw new Error(await mutRes.text());
        const mutStats = await mutRes.json();
        setMutCount(mutStats.variants ?? 0);

        const alRes = await fetch("/api/alignment/stats");
        if (!alRes.ok) throw new Error(await alRes.text());
        const alStats = await alRes.json();
        setAlignCount(alStats.alignments ?? 0);

        // ---- Donut: distribution des predictions
        const predMap = new Map<string, number>();
        for (const c of cls) {
          const key = (c.prediction ?? "Unknown").toString();
          predMap.set(key, (predMap.get(key) ?? 0) + 1);
        }
        const predData = Array.from(predMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);
        setPredictionData(predData);


        // ---- Chart 1: Growth par mois (sequences)
        const seqByMonth = new Map<string, number>();
        for (const s of sequences) {
          const createdAt = s.createdAt ?? s.created_at;
          if (!createdAt) continue;
          const k = monthKey(createdAt);
          seqByMonth.set(k, (seqByMonth.get(k) ?? 0) + 1);
        }
        setSequenceData(Array.from(seqByMonth.entries()).map(([month, sequences]) => ({ month, sequences })));

        // ---- Chart 2: Classifications per day
        const clsByDay = new Map<string, number>();

        for (const c of cls) {
          const k = dayKey(c.created_at);
          clsByDay.set(k, (clsByDay.get(k) ?? 0) + 1);
        }

        // tri chronologique + format affichage
        const daily = Array.from(clsByDay.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([day, classifications]) => ({ day, classifications }));

        setAnalysisData(daily);






        // ---- Recent activities (5 dernières classifications)
        const recent = [...cls]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((c) => ({
            id: c.id,
            type: "classification",
            description: `Classified DNA as ${c.prediction} (${Math.round(c.prob * 100)}%)`,
            time: new Date(c.created_at).toLocaleString(),
            icon: Sparkles,
          }));
        setRecentActivities(recent);

      } catch (e: any) {
        setErr(e?.message ?? "Erreur dashboard fetch");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="texft-3xl mb-2">Welcome back! 👋</h1>
            <p className="text-blue-50 opacity-90">
              {loading ? "Loading dashboard..." : "Ready to analyze some sequences today?"}
            </p>
            {err && <p className="mt-2 text-sm text-red-100">Erreur: {err}</p>}
          </div>
          <Button className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => onNavigate("sequence-input")}>
            <Sparkles className="w-4 h-4 mr-2" /> Start New Analysis
          </Button>
        </div>
      </div>

      {/* KPI Cards dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sequences Stored</p>
              <h3 className="text-3xl text-blue-600">{seqCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Classifications Stored</p>
              <h3 className="text-3xl text-purple-600">{clsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mutations Tested</p>
              <h3 className="text-3xl text-green-600">{mutCount}</h3>
              <p className="text-xs text-gray-500 mt-2"></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-0 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="mb-1">Sequence Library Growth</h3>
              <p className="text-sm text-gray-500">Monthly overview of stored sequences</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sequenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area type="monotone" dataKey="sequences" stroke="#3b82f6" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="mb-1">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest actions</p>
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <a.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{a.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{a.time}</p>
                </div>
              </div>
            ))}
            {!loading && recentActivities.length === 0 && (
              <p className="text-sm text-gray-500">No recent activity.</p>
            )}
          </div>
        </Card>
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="mb-1">Analysis Performance</h3>
            <p className="text-sm text-gray-500">Daily Classifications</p>
          </div>
          <Microscope className="w-5 h-5 text-gray-400" />
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analysisData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Line type="monotone" dataKey="classifications" stroke="#06b6d4" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>

      </Card>
      <Card className="p-6 border-0 shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="mb-1">Prediction Distribution</h3>
                      <p className="text-sm text-gray-500">Top predicted classes</p>
                    </div>
                    <Sparkles className="w-5 h-5 text-gray-400" />
                  </div>

                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Tooltip />
                      <Pie
                        data={predictionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={2}
                      >
                        {predictionData.map((_, i) => (
                          <Cell key={i} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-4 space-y-2">
                    {predictionData.map((p) => (
                      <div key={p.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 truncate">{p.name}</span>
                        <span className="text-gray-900 font-medium">{p.value}</span>
                      </div>
                    ))}
                    {!loading && predictionData.length === 0 && (
                      <p className="text-sm text-gray-500">No data yet.</p>
                    )}
                  </div>
      </Card>
    </div>
    </div>
  );
}
