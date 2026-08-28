import { BookOpen, CheckCircle2, FileCode2, Globe2, ScrollText, UserRound } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { heraldSites, type Herald } from "../generated/heralds";

function HeraldList({ heralds, type }: { heralds: Herald[]; type: "Name" | "Thread" }) {
  const Icon = type === "Name" ? UserRound : ScrollText;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="size-3.5" />
        {type} herald{heralds.length === 1 ? "" : "s"}
      </div>
      {heralds.map((herald) => (
        <div key={herald.file} className="rounded-xl border border-border/70 bg-background/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">{herald.name}</span>
            <Badge variant="outline" className="shrink-0 border-primary/30 text-primary">
              {herald.version}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeraldsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 pb-16 pt-4 md:space-y-20 md:pb-24 md:pt-10">
      <section className="relative overflow-hidden  rounded-[2rem] border border-primary/25 bg-card px-6 py-12 shadow-[0_24px_80px_-48px_color-mix(in_oklch,var(--foreground)_30%,transparent)] md:px-12 md:py-16">
        <div className="absolute inset-0 bg-grid-pattern text-primary opacity-[0.08]" />
        <div className="relative max-w-3xl">
          <Badge className="mb-5 gap-1.5">
            <CheckCircle2 className="size-3.5" /> Production support
          </Badge>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">Heralds</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Heralds teach Vegan Mage how to identify a signed-in person and capture a selected post
            with its discussion. These are the domains currently supported in production.
          </p>
        </div>
      </section>

      <section aria-labelledby="supported-domains">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
              Supported domains
            </p>
            <h2 id="supported-domains" className="mt-2 text-3xl font-bold">
              Ready for use
            </h2>
          </div>
          <span className="rounded-full bg-primary-card px-3 py-1 text-sm font-semibold text-primary">
            {heraldSites.length} sites
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {heraldSites.map((site) => (
            <Card key={site.domain} className="border-border/70 bg-card shadow-sm">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-card text-primary">
                    <Globe2 className="size-5" />
                  </span>
                  <h3 className="text-xl font-bold">{site.domain}</h3>
                </div>
                <HeraldList heralds={site.names} type="Name" />
                <HeraldList heralds={site.threads} type="Thread" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-primary/20 bg-primary-card/50">
          <CardContent className="p-7 md:p-8">
            <BookOpen className="size-7 text-primary" />
            <h2 className="mt-5 text-2xl font-bold">What makes a site supported?</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              A production domain needs both herald types: a name herald to resolve the active
              account and a thread herald to capture the selected post and replies. The list above
              is generated from domains present in both production directories.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card">
          <CardContent className="p-7 md:p-8">
            <FileCode2 className="size-7 text-primary" />
            <h2 className="mt-5 text-2xl font-bold">Add a herald</h2>
            <ol className="mt-4 space-y-3 text-muted-foreground">
              <li>
                <span className="mr-2 font-bold text-primary">1.</span>Add a production name config
                at{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
                  herald/harvester/production/name/&lt;domain&gt;-&lt;n&gt;.json
                </code>
                .
              </li>
              <li>
                <span className="mr-2 font-bold text-primary">2.</span>Add its production thread
                config at{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
                  herald/harvester/production/thread/&lt;domain&gt;-&lt;n&gt;.json
                </code>
                .
              </li>
              <li>
                <span className="mr-2 font-bold text-primary">3.</span>Use a positive number for{" "}
                <code>&lt;n&gt;</code>, include a name and version in both configs, and validate the
                capture behavior.
              </li>
              <li>
                <span className="mr-2 font-bold text-primary">4.</span>Run the web build. It
                regenerates this page's support data from the production configs.
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
