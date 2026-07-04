import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import type { MetricCardData } from "@/lib/types";

type MetricGridProps = {
  metrics: MetricCardData[];
};

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={metric.label} className={index === 0 ? "xl:col-span-2" : undefined}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-normal">
                  {formatMoney(metric.valuePence)}
                </p>
              </div>
              <span className="rounded-lg bg-accent p-2 text-accent-foreground">
                <ArrowUpRight className="size-4" />
              </span>
            </div>
            {metric.helper ? (
              <p className="mt-4 text-xs font-medium text-muted-foreground">{metric.helper}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
