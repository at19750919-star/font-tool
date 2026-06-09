import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

// 預設範例字（中文字型用）：涵蓋中文、英文、數字
const DEFAULT_SAMPLE = "永 國 字體 Aa 123";

interface Props {
  name: string;
  value: string; // 形如 'LocalFont_xxx'（含引號）
  selected: boolean;
  onSelect: () => void;
  onDelete?: () => void; // 網路字型不提供，就不顯示刪除鈕
  ensureFontLoaded: (cssValue: string) => void;
  sample?: string; // 範例字；英文字型可傳拉丁範例
  cn?: string; // 中文名稱（有才顯示）
  row?: boolean; // true = 一行一個字型（左名稱右範例，看得更清楚）
}

export function LocalFontRow({
  name,
  value,
  selected,
  onSelect,
  onDelete,
  ensureFontLoaded,
  sample = DEFAULT_SAMPLE,
  cn,
  row = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // 捲動進入可視範圍時才載入該字型，避免一次載入全部
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          ensureFontLoaded(value);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, ensureFontLoaded]);

  const deleteBtn = onDelete && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
      title="刪除字型"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );

  // 一行一個字型：左側名稱（含中文名）、右側大字範例，看得最清楚
  if (row) {
    return (
      <div
        ref={ref}
        onClick={onSelect}
        className={`flex items-center gap-4 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
          selected
            ? "border-green-400 bg-green-50 ring-1 ring-green-400"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <div className="w-44 shrink-0 leading-tight">
          <div className="text-sm font-medium text-gray-700 break-words">{name}</div>
          {cn && <div className="text-xs text-gray-400 break-words mt-0.5">{cn}</div>}
        </div>
        <div
          className="flex-1 min-w-0 text-3xl leading-relaxed truncate"
          style={{ fontFamily: `${value}, sans-serif` }}
        >
          {sample}
        </div>
        {deleteBtn}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
        selected
          ? "border-green-400 bg-green-50 ring-1 ring-green-400"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {deleteBtn && <div className="absolute top-2 right-2">{deleteBtn}</div>}
      <div className="text-xs text-gray-400 break-words leading-tight pr-6">
        {name}
        {cn && <span className="text-gray-400"> · {cn}</span>}
      </div>
      <div
        className="text-3xl leading-relaxed truncate mt-1"
        style={{ fontFamily: `${value}, sans-serif` }}
      >
        {sample}
      </div>
    </div>
  );
}
