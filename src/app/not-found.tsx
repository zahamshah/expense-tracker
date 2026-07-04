import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">The page you requested does not exist.</p>
        <Button asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
