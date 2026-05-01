import Link from "next/link";
import { Activity, BarChart3, BrainCircuit, GitBranch, SearchCheck, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/scenario", label: "Scenario Simulator", icon: BarChart3 },
  { href: "/causal-graph", label: "Causal Graph", icon: GitBranch },
  { href: "/divergence", label: "Divergence Monitor", icon: ShieldAlert },
  { href: "/audit/1", label: "Audit Trace", icon: SearchCheck },
];

export function AppShell({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  return (
    <div className="min-h-screen">
      <div className="terminal-grid min-h-screen">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3 text-primary">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Macro Intelligence Platform</div>
                <div className="text-lg font-semibold">Interactive Reasoning Workbench</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="accent">Django Connected</Badge>
              <Badge variant="warning">Scenario Mode</Badge>
            </div>
          </div>
        </header>
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-border/70 bg-card/70 p-4 shadow-terminal lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    pathname === href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-6 rounded-2xl border border-border/70 bg-panel/70 p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Workbench Notes</div>
              <p className="mt-3 text-sm text-muted-foreground">
                Move between macro state, causal pathways, simulation runs, and divergence explanations without leaving context.
              </p>
            </div>
          </aside>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}

