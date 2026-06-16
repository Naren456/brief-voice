import { CloudUpload } from "lucide-react";
import { useCallback, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";

const ACCEPTED = [".mp3", ".wav", ".m4a"];
const MAX_BYTES = 50 * 1024 * 1024;

interface DropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFile, disabled }: DropzoneProps) {
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError(`Unsupported format. Allowed: ${ACCEPTED.join(", ")}`);
      return false;
    }
    if (file.size > MAX_BYTES) {
      setError("File exceeds 50MB. Trim or compress.");
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDrag(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file && validate(file)) onFile(file);
    },
    [disabled, onFile, validate],
  );

  return (
    <div className="space-y-sm">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={cn(
          "relative group rounded-xl border-2 border-dashed p-2xl text-center transition-all",
          "bg-surface-container-low",
          drag
            ? "border-primary bg-surface-container shadow-glow-primary"
            : "border-outline-variant hover:border-primary/40",
          disabled && "opacity-60 pointer-events-none",
        )}
      >
        <input
          type="file"
          accept={ACCEPTED.join(",")}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && validate(file)) onFile(file);
          }}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CloudUpload className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-geist text-headline-md text-on-surface mb-1">
              Drop audio assets here
            </p>
            <p className="font-geist text-body-md text-on-surface-variant">
              Supports .mp3, .wav, .m4a (Max 50MB)
            </p>
          </div>
          <div className="flex items-center gap-xs">
            {ACCEPTED.map((ext) => (
              <span
                key={ext}
                className="px-2 py-0.5 rounded font-mono text-label-sm uppercase tracking-wider bg-surface-container-highest text-on-surface-variant"
              >
                {ext.replace(".", "")}
              </span>
            ))}
          </div>
        </div>
      </div>
      {error && (
        <p className="font-mono text-label-md text-error uppercase tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
}
