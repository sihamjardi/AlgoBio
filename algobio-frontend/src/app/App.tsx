
import { useState } from "react";
import { 
  LayoutDashboard, 
  Dna, 
  GitCompare, 
  Sparkles, 
  FlaskConical, 
  Microscope, 
  Database, 
  Settings as SettingsIcon,
  Menu,
  X
} from "lucide-react";
import { DashboardHome } from "../components/DashboardHome";
import { SequenceInput } from "../components/SequenceInput";
import { CompareSequences } from "../components/CompareSequences";
import { AIClassification } from "../components/AIClassification";
import { MutationTesting } from "../components/MutationTesting";
import { SimilaritySearch } from "../components/SimilaritySearch";
import { SequenceHistory } from "../components/SequenceHistory";
import { Settings } from "../components/Settings";
import { Button } from "../components/ui/button";

type Page = 
  | "dashboard" 
  | "sequence-input" 
  | "compare" 
  | "ai-classification" 
  | "mutation-testing" 
  | "similarity-search" 
  | "history" 
  | "settings";

interface NavItem {
  id: Page;
  label: string;
  icon: any;
  gradient: string;
}

const navigation: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "from-blue-500 to-cyan-500" },
  { id: "sequence-input", label: "Enter Sequence", icon: Dna, gradient: "from-purple-500 to-pink-500" },
  { id: "compare", label: "Compare Sequences", icon: GitCompare, gradient: "from-green-500 to-emerald-500" },
  { id: "ai-classification", label: "AI Classification", icon: Sparkles, gradient: "from-violet-500 to-purple-500" },
  { id: "mutation-testing", label: "Test Mutations", icon: FlaskConical, gradient: "from-orange-500 to-red-500" },
  { id: "similarity-search", label: "BLAST Search", icon: Microscope, gradient: "from-cyan-500 to-blue-500" },
  { id: "history", label: "Sequence Library", icon: Database, gradient: "from-indigo-500 to-blue-500" },
  { id: "settings", label: "Settings", icon: SettingsIcon, gradient: "from-gray-500 to-slate-500" },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardHome onNavigate={setCurrentPage} />;
      case "sequence-input":
        return <SequenceInput />;
      case "compare":
        return <CompareSequences />;
      case "ai-classification":
        return <AIClassification />;
      case "mutation-testing":
        return <MutationTesting />;
      case "similarity-search":
        return <SimilaritySearch />;
      case "history":
        return <SequenceHistory />;
      case "settings":
        return <Settings />;
      default:
        return <DashboardHome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg z-50 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 w-72
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">AlgoBio</h1>
                <p className="text-xs text-gray-500">Bioinformatics Suite</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-md` 
                    : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <div className="text-xs text-center text-gray-500">
            <p>AlgoBio v1.0</p>
            <p className="mt-1">© 2025 - Research Tool</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-72 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl">
                  {navigation.find(n => n.id === currentPage)?.label || "Dashboard"}
                </h2>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Advanced bioinformatics analysis platform
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm">Dr. Sarah Smith</p>
                <p className="text-xs text-gray-500">Researcher</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                DS
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
