export type SavedStyleEntry = {
  name: string;
  state: Record<string, unknown>;
};

export type SavedStyleMode = "text" | "button" | "card" | "image" | "unknown";

type SavedStylesBackup = {
  app: "font-preview-tool";
  version: 1;
  exportedAt: string;
  styles: SavedStyleEntry[];
};

const assertSavedStyleEntry = (entry: unknown): SavedStyleEntry => {
  if (!entry || typeof entry !== "object") {
    throw new Error("Invalid saved style entry");
  }

  const candidate = entry as Partial<SavedStyleEntry>;
  if (
    typeof candidate.name !== "string" ||
    candidate.name.trim() === "" ||
    !candidate.state ||
    typeof candidate.state !== "object" ||
    Array.isArray(candidate.state)
  ) {
    throw new Error("Invalid saved style entry");
  }

  return {
    name: candidate.name.trim(),
    state: candidate.state as Record<string, unknown>,
  };
};

const readBackupStyles = (text: string): SavedStyleEntry[] => {
  const parsed = JSON.parse(text) as unknown;
  const styles = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object"
      ? (parsed as Partial<SavedStylesBackup>).styles
      : null;

  if (!Array.isArray(styles)) {
    throw new Error("Invalid saved styles backup");
  }

  return styles.map(assertSavedStyleEntry);
};

export const getSavedStyleMode = (style: SavedStyleEntry): SavedStyleMode => {
  const mode = style.state.previewMode;
  return mode === "text" || mode === "button" || mode === "card" || mode === "image"
    ? mode
    : "unknown";
};

export const getSavedStyleModeLabel = (style: SavedStyleEntry) => {
  const mode = getSavedStyleMode(style);
  const labels: Record<SavedStyleMode, string> = {
    text: "文字",
    button: "按鈕",
    card: "卡片",
    image: "圖片",
    unknown: "未分類",
  };
  return labels[mode];
};

export const filterSavedStyles = (
  styles: SavedStyleEntry[],
  filters: { query?: string; mode?: SavedStyleMode | "all" },
) => {
  const query = filters.query?.trim().toLowerCase() || "";
  const mode = filters.mode || "all";

  return styles.filter((style) => {
    const modeMatches = mode === "all" || getSavedStyleMode(style) === mode;
    if (!modeMatches) return false;
    if (!query) return true;

    const searchable = [
      style.name,
      getSavedStyleModeLabel(style),
      String(style.state.previewText || ""),
      String(style.state.selectedFont && typeof style.state.selectedFont === "object"
        ? (style.state.selectedFont as { name?: unknown }).name || ""
        : ""),
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
};

export const summarizeSavedStyleImport = (
  existingStyles: SavedStyleEntry[],
  incomingStyles: SavedStyleEntry[],
) => {
  const existingNames = new Set(existingStyles.map((style) => style.name));
  const incomingNames = new Set(incomingStyles.map((style) => style.name));
  const overwritten = incomingStyles.filter((style) => existingNames.has(style.name)).length;
  const added = incomingStyles.filter((style) => !existingNames.has(style.name)).length;

  return {
    added,
    overwritten,
    total: existingStyles.length + [...incomingNames].filter((name) => !existingNames.has(name)).length,
  };
};

export const createSavedStylesBackup = (
  styles: SavedStyleEntry[],
  exportedAt = new Date(),
) => {
  const backup: SavedStylesBackup = {
    app: "font-preview-tool",
    version: 1,
    exportedAt: exportedAt.toISOString(),
    styles: styles.map(assertSavedStyleEntry),
  };

  return JSON.stringify(backup, null, 2);
};

export const parseSavedStylesBackup = (
  text: string,
  existingStyles: SavedStyleEntry[] = [],
) => {
  const incomingStyles = readBackupStyles(text);
  const byName = new Map(existingStyles.map((style) => [style.name, style]));

  incomingStyles.forEach((style) => byName.set(style.name, style));

  return [
    ...existingStyles
      .map((style) => byName.get(style.name))
      .filter((style): style is SavedStyleEntry => Boolean(style)),
    ...incomingStyles.filter(
      (style) => !existingStyles.some((existing) => existing.name === style.name),
    ),
  ];
};
