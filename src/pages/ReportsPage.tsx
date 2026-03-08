import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, AlertCircle, ChevronRight, Clock, CheckCircle } from "lucide-react";
import { FollowUpPrompts, reportPrompts, emptyStatePrompts } from "@/components/FollowUpPrompts";
import { getReportsIndex, type Report } from "@/lib/dataService";
import { TravelingIntelligence } from "@/components/TravelingIntelligence";

const typeLabels: Record<Report["type"], string> = {
  rrc_filing: "RRC Filing",
  operator_report: "Operator Report",
  production_report: "Production Report",
  division_order: "Division Order",
  pooling_order: "Pooling Order",
};

const statusIcons = {
  new: Clock,
  reviewed: CheckCircle,
  requires_attention: AlertCircle,
};

const statusColors = {
  new: "text-info",
  reviewed: "text-muted-foreground",
  requires_attention: "text-warning",
};

const statusLabels = {
  new: "New",
  reviewed: "Reviewed",
  requires_attention: "Needs Attention",
};

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<Report["status"] | "all">("all");
  const openIntelligence = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-intelligence"));
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getReportsIndex();
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredReports = filter === "all" 
    ? reports 
    : reports.filter((r) => r.status === filter);

  const newCount = reports.filter((r) => r.status === "new").length;
  const attentionCount = reports.filter((r) => r.status === "requires_attention").length;

  if (isLoading) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
        <header className="mb-6">
          <Link
            to="/app/explore"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
          <h1 className="text-xl md:text-2xl text-foreground mb-1">Reports & Filings</h1>
          <p className="text-sm text-muted-foreground">Loading reports...</p>
        </header>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="calm-card animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <Link
          to="/app/explore"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
        <h1 className="text-xl md:text-2xl text-foreground mb-1">Reports & Filings</h1>
        <p className="text-sm text-muted-foreground">
          Public reports related to your interests — Intelligence can summarize these for you
        </p>
      </header>

      {/* Intelligence Summary */}
      <TravelingIntelligence subPage="reports" onOpenIntelligence={openIntelligence} className="mb-6" />

      {/* Status Summary */}
      {(newCount > 0 || attentionCount > 0) && (
        <div className="calm-card mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-info" />
          </div>
          <div>
            <p className="text-sm text-foreground">
              {newCount > 0 && `${newCount} new report${newCount > 1 ? "s" : ""} to review`}
              {newCount > 0 && attentionCount > 0 && " • "}
              {attentionCount > 0 && `${attentionCount} may need attention`}
            </p>
            <p className="text-xs text-muted-foreground">
              Recent filings related to your mineral interests.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            filter === "all"
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({reports.length})
        </button>
        <button
          onClick={() => setFilter("requires_attention")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            filter === "requires_attention"
              ? "bg-warning/20 text-warning"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          Needs Attention ({attentionCount})
        </button>
        <button
          onClick={() => setFilter("new")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            filter === "new"
              ? "bg-info/20 text-info"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          New ({newCount})
        </button>
        <button
          onClick={() => setFilter("reviewed")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            filter === "reviewed"
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          Reviewed
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report) => {
          const StatusIcon = statusIcons[report.status];
          
          return (
            <Link
              key={report.id}
              to={`/app/explore/reports/${report.id}`}
              className="calm-card block hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{typeLabels[report.type]}</span>
                    <span className={`flex items-center gap-1 text-xs ${statusColors[report.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusLabels[report.status]}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-medium text-foreground mb-1 truncate">
                    {report.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {report.summary || report.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/70">
                    <span>{new Date(report.filedDate).toLocaleDateString()}</span>
                    {report.relatedMineralName && (
                      <>
                        <span>•</span>
                        <span>{report.relatedMineralName}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No reports match this filter</p>
          <FollowUpPrompts 
            prompts={emptyStatePrompts} 
            context="reports-empty"
            className="justify-center"
          />
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        Documents sourced from public filings. MineralView does not verify legal ownership.
      </p>
    </div>
  );
}
