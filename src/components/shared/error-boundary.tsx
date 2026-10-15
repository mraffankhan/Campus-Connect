"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Component Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold tracking-tight">Something went wrong</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {error.message || "An unexpected error occurred while loading this section."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()} variant="default" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          Reload Page
        </Button>
      </div>
    </div>
  );
}
