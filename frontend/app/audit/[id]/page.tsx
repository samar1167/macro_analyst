import { AuditTraceView } from "@/components/audit/audit-trace-view";
import { api } from "@/lib/api";

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await api.getAuditRun(id);
  return <AuditTraceView audit={audit} />;
}

