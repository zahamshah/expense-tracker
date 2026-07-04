import { Database, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupRequired() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Database className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Setup Required</p>
            <CardTitle>Connect and migrate the database</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The app is running, but Prisma cannot read the expense tables yet. Add your database
          environment variables, then run the migration and seed commands.
        </p>
        <div className="rounded-lg border bg-background p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Terminal className="size-4" />
            Commands
          </div>
          <pre className="overflow-x-auto text-sm leading-7 text-muted-foreground">
            {`copy .env.example .env
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
