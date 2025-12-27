import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Activity, 
  Database, 
  GitCompare, 
  FlaskConical, 
  TrendingUp,
  Clock,
  Dna,
  Microscope,
  Sparkles
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const sequenceData = [
  { month: "Jan", sequences: 45 },
  { month: "Feb", sequences: 62 },
  { month: "Mar", sequences: 58 },
  { month: "Apr", sequences: 75 },
  { month: "May", sequences: 88 },
  { month: "Jun", sequences: 92 },
];

const analysisData = [
  { week: "W1", alignments: 12, classifications: 8 },
  { week: "W2", alignments: 18, classifications: 15 },
  { week: "W3", alignments: 22, classifications: 19 },
  { week: "W4", alignments: 28, classifications: 24 },
];

const recentActivities = [
  { id: 1, type: "alignment", description: "Compared BRCA1 sequences", time: "2 hours ago", icon: GitCompare },
  { id: 2, type: "classification", description: "Classified unknown viral DNA", time: "5 hours ago", icon: Sparkles },
  { id: 3, type: "mutation", description: "Tested p53 mutation impact", time: "1 day ago", icon: FlaskConical },
  { id: 4, type: "sequence", description: "Added new DNA sequence to library", time: "2 days ago", icon: Dna },
];

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl mb-2">Welcome back, Dr. Smith! 👋</h1>
            <p className="text-blue-50 opacity-90">Ready to analyze some sequences today?</p>
          </div>
          <Button 
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => onNavigate('sequence-input')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start New Analysis
          </Button>
        </div>
        
        {/* Quick Access Shortcuts */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <button 
            onClick={() => onNavigate('sequence-input')}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-xl p-4 text-left"
          >
            <Dna className="w-5 h-5 mb-2" />
            <p className="text-sm">New Sequence</p>
          </button>
          <button 
            onClick={() => onNavigate('compare')}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-xl p-4 text-left"
          >
            <GitCompare className="w-5 h-5 mb-2" />
            <p className="text-sm">Compare</p>
          </button>
          <button 
            onClick={() => onNavigate('ai-classification')}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-xl p-4 text-left"
          >
            <Sparkles className="w-5 h-5 mb-2" />
            <p className="text-sm">AI Classify</p>
          </button>
          <button 
            onClick={() => onNavigate('similarity-search')}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all rounded-xl p-4 text-left"
          >
            <Microscope className="w-5 h-5 mb-2" />
            <p className="text-sm">BLAST Search</p>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sequences Stored</p>
              <h3 className="text-3xl text-blue-600">1,248</h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Alignments Done</p>
              <h3 className="text-3xl text-purple-600">892</h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% this week
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <GitCompare className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mutations Tested</p>
              <h3 className="text-3xl text-green-600">456</h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15% this week
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sequence Growth Chart */}
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
              <defs>
                <linearGradient id="colorSequences" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="sequences" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorSequences)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6 border-0 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="mb-1">Recent Activity</h3>
              <p className="text-sm text-gray-500">Your latest actions</p>
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <activity.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Analysis Metrics */}
      <Card className="p-6 border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="mb-1">Analysis Performance</h3>
            <p className="text-sm text-gray-500">Weekly alignments and classifications</p>
          </div>
          <Microscope className="w-5 h-5 text-gray-400" />
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analysisData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="alignments" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="classifications" 
              stroke="#06b6d4" 
              strokeWidth={2}
              dot={{ fill: '#06b6d4', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600">Alignments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-sm text-gray-600">Classifications</span>
          </div>
        </div>
      </Card>
    </div>
  );
}