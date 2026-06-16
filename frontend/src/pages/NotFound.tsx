import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="min-h-full flex items-center justify-center px-lg py-2xl">
      <div className="text-center space-y-md">
        <p className="font-mono text-label-md text-on-surface-variant uppercase tracking-widest">
          404 — Signal lost
        </p>
        <h1 className="font-geist font-semibold text-headline-lg">No such intelligence route.</h1>
        <Button variant="primary" asChild>
          <Link to="/">Return to ingestion</Link>
        </Button>
      </div>
    </div>
  );
}
