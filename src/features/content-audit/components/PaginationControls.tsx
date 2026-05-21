import Button from "@/components/ui/Button";
import type { PaginationMeta } from "@/lib/api/services/content-audit";

interface PaginationControlsProps {
  meta?: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  meta,
  page,
  onPageChange,
}: PaginationControlsProps) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-4 text-sm">
      <span className="text-muted-foreground">
        {meta.from}-{meta.to} من {meta.total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          السابق
        </Button>
        <span className="min-w-16 text-center font-medium">
          {page} / {meta.last_page}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= meta.last_page}
          onClick={() => onPageChange(page + 1)}
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
