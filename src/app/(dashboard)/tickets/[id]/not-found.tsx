import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function TicketNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
        <FileQuestion className="h-8 w-8 text-slate-400" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">Ticket not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        The ticket you are looking for does not exist or may have been removed.
      </p>
      <Link href="/tickets" className="mt-6">
        <Button size="sm">
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Button>
      </Link>
    </div>
  );
}
