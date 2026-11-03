"use client";

import { useState, useTransition } from "react";
import { Paperclip, Upload, FileText, Image as ImageIcon } from "lucide-react";
import type { Attachment } from "@/types";
import { formatRelative } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) {
    return <ImageIcon className="h-4 w-4 text-sky-400" />;
  }
  return <FileText className="h-4 w-4 text-slate-400" />;
}

export function TicketAttachments({
  ticketId,
  attachments,
  canUpload,
}: {
  ticketId: string;
  attachments: Attachment[];
  canUpload: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setError(null);
    setMessage(null);

    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Sign in required to upload");
          return;
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${ticketId}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(path, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        const { error: metaError } = await supabase.from("attachments").insert({
          ticket_id: ticketId,
          uploaded_by: user.id,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || "application/octet-stream",
          storage_path: path,
        });

        if (metaError) {
          setError(metaError.message);
          return;
        }

        setMessage(`Uploaded ${file.name}`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Paperclip className="h-3.5 w-3.5" />
          Attachments ({attachments.length})
        </h3>
        {canUpload && (
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              disabled={isPending}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
                e.target.value = "";
              }}
            />
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700">
              <Upload className="h-3.5 w-3.5" />
              {isPending ? "Uploading…" : "Upload"}
            </span>
          </label>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-slate-500">No files attached yet.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
            >
              <FileIcon mime={file.mimeType} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.fileName}</p>
                <p className="text-[11px] text-slate-500">
                  {formatBytes(file.fileSize)}
                  {file.uploaderName ? ` · ${file.uploaderName}` : ""}
                  {" · "}
                  {formatRelative(file.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {message && <p className="mt-3 text-xs text-emerald-400">{message}</p>}
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}
