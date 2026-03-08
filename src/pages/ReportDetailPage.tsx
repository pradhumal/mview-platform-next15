import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FollowUpPrompts, reportPrompts } from "@/components/FollowUpPrompts";
import { getReportDetail, type ReportDetail } from "@/lib/dataService";
import ReactMarkdown from "react-markdown";

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState<ReportDetail | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const data = await getReportDetail(id);
        setReport(data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
        <header className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-6 bg-muted rounded w-2/3 animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
        </header>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-12">
        <header className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-xl text-foreground">Report not found</h1>
        </header>
        <Link to="/app/explore/reports">
          <Button variant="outline">Back to Reports</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-12 animate-fade-in">
      {/* Header */}
      <header className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </button>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg md:text-xl text-foreground mb-1">{report.title}</h1>
            <p className="text-sm text-muted-foreground">
              Filed {new Date(report.filedDate).toLocaleDateString()} • {report.source}
            </p>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      {report.keyMetrics && report.keyMetrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {report.keyMetrics.map((metric, i) => (
            <div key={i} className="calm-card py-3">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-sm font-medium text-foreground">{metric.value}</p>
              {metric.change && (
                <p className={`text-xs ${
                  metric.changeType === "positive" ? "text-success" :
                  metric.changeType === "negative" ? "text-destructive" :
                  "text-muted-foreground"
                }`}>
                  {metric.change}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Related Interest */}
      {report.relatedMineralName && (
        <Link
          to={`/app/explore/minerals/${report.relatedMineralId}`}
          className="calm-card mb-6 flex items-center justify-between hover:border-primary/20 transition-colors"
        >
          <div>
            <p className="text-xs text-muted-foreground">Related Interest</p>
            <p className="text-sm font-medium text-foreground">{report.relatedMineralName}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      )}

      {/* Actions */}
      {report.actions && report.actions.length > 0 && (
        <div className="calm-card mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Recommended Actions</h3>
          <div className="space-y-3">
            {report.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  action.priority === "required" ? "bg-warning" :
                  action.priority === "recommended" ? "bg-info" :
                  "bg-muted"
                }`} />
                <div>
                  <p className="text-sm text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Content */}
      <div className="calm-card mb-6">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{report.fullContent}</ReactMarkdown>
        </div>
        
        {/* Follow-up prompts */}
        <FollowUpPrompts 
          prompts={reportPrompts} 
          context={`report-${report.type}`}
        />
      </div>

      {/* Document Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" disabled>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" className="flex-1" disabled>
          <ExternalLink className="w-4 h-4 mr-2" />
          View Original
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        Document sourced from public filings. MineralView does not provide legal advice.
      </p>
    </div>
  );
}
