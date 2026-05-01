import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";
import { api } from "@/lib/api";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await api.getOpportunity(id);
  return <OpportunityDetail opportunity={opportunity} />;
}

