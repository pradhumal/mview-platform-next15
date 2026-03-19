#!/usr/bin/env python3
"""
analyze_repo_cleanup.py

Purpose:
- scan a repo
- build a file inventory
- parse imports and references
- detect likely dead code
- detect legacy mortgage / vacation-rental / ClickEngine artifacts
- identify files that are likely:
    - keep
    - review
    - isolate
    - remove_candidate

Safe by design:
- does NOT modify or delete files
- produces JSON + Markdown reports for human review

Example:
    python analyze_repo_cleanup.py /Users/shaun/Documents/GitHub/MV-Admin

Outputs:
    ./repo_cleanup_outputs/repo_index.json
    ./repo_cleanup_outputs/path_usage_map.json
    ./repo_cleanup_outputs/removal_candidates.json
    ./repo_cleanup_outputs/removal_candidates.md
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from collections import defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Set, Tuple

# ----------------------------
# Config
# ----------------------------

INCLUDE_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".py", ".md", ".json", ".sql", ".yaml", ".yml",
    ".css", ".scss"
}

IGNORE_DIRS = {
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    ".turbo",
    ".vercel",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".idea",
    ".DS_Store",
    "coverage",
    ".coverage",
}

LEGACY_KEYWORDS = {
    "mortgage": 4,
    "loan": 3,
    "loan_program": 5,
    "loan_programs": 5,
    "lender": 4,
    "borrower": 4,
    "mortgage_persona": 5,
    "mortgage_product": 5,
    "ownerrez": 5,
    "vacation_rental": 5,
    "vacation rentals": 5,
    "booking": 3,
    "reservation": 3,
    "clickengine": 5,
    "clickengine.ai": 5,
    "exampleplatform": 5,
    "luxury_property_rental": 5,
    "rental": 2,
    "short term rental": 4,
    "airbnb": 4,
    "vrbo": 4,
}

MINERALVIEW_KEYWORDS = {
    "constitution": 4,
    "statement": 3,
    "division order": 4,
    "lease": 2,
    "operator": 3,
    "owner": 2,
    "mineral": 4,
    "royalty": 4,
    "asset": 2,
    "intelligence": 3,
    "document ingestion": 4,
    "stripe": 2,
    "faq": 2,
    "blog": 2,
    "persona": 2,
    "seo": 2,
    "llmo": 3,
}

ENTRYPOINT_HINTS = [
    "main.ts",
    "main.tsx",
    "index.ts",
    "index.tsx",
    "app.ts",
    "app.tsx",
    "layout.tsx",
    "page.tsx",
    "server.py",
    "main.py",
    "manage.py",
]

SAFE_KEEP_PATH_HINTS = [
    "constitution",
    "website",
    "blog",
    "faq",
    "persona",
    "seo",
    "campaign",
    "billing",
    "stripe",
    "intelligence",
    "data-intake",
    "data_intake",
    "statement",
    "document",
    "upload",
]

# ----------------------------
# Regexes
# ----------------------------

IMPORT_RE_TS = re.compile(
    r"""import\s+(?:.+?\s+from\s+)?["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)""",
    re.MULTILINE,
)

EXPORT_RE_TS = re.compile(
    r"""export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)?\s*([A-Za-z0-9_]+)?""",
    re.MULTILINE,
)

PY_IMPORT_RE = re.compile(
    r"""^\s*import\s+([A-Za-z0-9_.,\s]+)|^\s*from\s+([A-Za-z0-9_\.]+)\s+import\s+""",
    re.MULTILINE,
)

PY_DEF_RE = re.compile(
    r"""^\s*(?:async\s+def|def|class)\s+([A-Za-z0-9_]+)""",
    re.MULTILINE,
)

STRING_PATH_RE = re.compile(r"""["'`]([^"'`]+)["'`]""")

# ----------------------------
# Data structures
# ----------------------------

@dataclass
class FileRecord:
    path: str
    extension: str
    size_bytes: int
    line_count: int
    sha256: str
    imports: List[str]
    exports: List[str]
    import_count: int
    imported_by_count: int
    literal_reference_count: int
    legacy_score: int
    mineralview_score: int
    legacy_hits: Dict[str, int]
    mineralview_hits: Dict[str, int]
    is_entrypoint_like: bool
    classification: str
    reasons: List[str]
    preview: str

# ----------------------------
# Helpers
# ----------------------------

def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()

def should_skip_dir(dirname: str) -> bool:
    return dirname in IGNORE_DIRS

def is_included_file(path: Path) -> bool:
    return path.suffix.lower() in INCLUDE_EXTENSIONS

def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

def normalize_rel_path(root: Path, path: Path) -> str:
    return str(path.relative_to(root)).replace("\\", "/")

def score_keywords(text: str, keyword_weights: Dict[str, int]) -> Tuple[int, Dict[str, int]]:
    lower = text.lower()
    hits: Dict[str, int] = {}
    score = 0
    for kw, weight in keyword_weights.items():
        count = lower.count(kw.lower())
        if count > 0:
            hits[kw] = count
            score += count * weight
    return score, hits

def extract_imports(path: Path, text: str) -> List[str]:
    imports: List[str] = []
    ext = path.suffix.lower()

    if ext in {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}:
        for m in IMPORT_RE_TS.finditer(text):
            mod = m.group(1) or m.group(2)
            if mod:
                imports.append(mod.strip())

    elif ext == ".py":
        for m in PY_IMPORT_RE.finditer(text):
            a = m.group(1)
            b = m.group(2)
            if a:
                parts = [p.strip() for p in a.split(",") if p.strip()]
                imports.extend(parts)
            elif b:
                imports.append(b.strip())

    return sorted(set(imports))

def extract_exports(path: Path, text: str) -> List[str]:
    exports: List[str] = []
    ext = path.suffix.lower()

    if ext in {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}:
        for m in EXPORT_RE_TS.finditer(text):
            name = m.group(1)
            if name:
                exports.append(name.strip())

    elif ext == ".py":
        for m in PY_DEF_RE.finditer(text):
            exports.append(m.group(1).strip())

    return sorted(set(exports))

def resolve_relative_import(from_file: str, import_path: str) -> str | None:
    if not import_path.startswith("."):
        return None

    from_path = Path(from_file)
    base = from_path.parent
    candidate = (base / import_path).as_posix()

    possible = [
        candidate,
        candidate + ".ts",
        candidate + ".tsx",
        candidate + ".js",
        candidate + ".jsx",
        candidate + ".py",
        candidate + "/index.ts",
        candidate + "/index.tsx",
        candidate + "/index.js",
        candidate + "/index.jsx",
        candidate + "/__init__.py",
    ]
    return possible[0]  # actual matching happens later

def find_literal_path_references(all_texts: Dict[str, str], repo_paths: Set[str]) -> Dict[str, int]:
    counts = defaultdict(int)
    for file_path, text in all_texts.items():
        for candidate in repo_paths:
            if candidate == file_path:
                continue
            # very conservative literal string match
            if candidate in text:
                counts[candidate] += 1
            else:
                name_only = Path(candidate).stem
                if len(name_only) >= 4 and re.search(rf"\b{re.escape(name_only)}\b", text):
                    counts[candidate] += 1
    return dict(counts)

def path_hint_contains(path: str, hints: List[str]) -> bool:
    lower = path.lower()
    return any(h in lower for h in hints)

def preview_text(text: str, max_chars: int = 1000) -> str:
    text = text.strip()
    return text[:max_chars]

# ----------------------------
# Main analysis
# ----------------------------

def scan_repo(root: Path) -> Tuple[Dict[str, str], Dict[str, dict]]:
    texts: Dict[str, str] = {}
    meta: Dict[str, dict] = {}

    for current_root, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if not should_skip_dir(d)]

        for fname in files:
            path = Path(current_root) / fname
            if not is_included_file(path):
                continue

            rel = normalize_rel_path(root, path)
            text = read_text(path)
            if not text:
                continue

            texts[rel] = text
            meta[rel] = {
                "path_obj": path,
                "extension": path.suffix.lower(),
                "size_bytes": path.stat().st_size,
                "line_count": len(text.splitlines()),
                "sha256": sha256_text(text),
            }

    return texts, meta

def analyze_repo(root: Path) -> Tuple[List[FileRecord], Dict[str, List[str]], Dict[str, int]]:
    texts, meta = scan_repo(root)
    repo_paths = set(texts.keys())

    imports_map: Dict[str, List[str]] = {}
    exports_map: Dict[str, List[str]] = {}
    imported_by: Dict[str, Set[str]] = defaultdict(set)

    for rel, text in texts.items():
        path_obj = meta[rel]["path_obj"]
        imports = extract_imports(path_obj, text)
        exports = extract_exports(path_obj, text)

        imports_map[rel] = imports
        exports_map[rel] = exports

    # Build imported_by map for relative imports only
    for rel, imports in imports_map.items():
        for imp in imports:
            resolved = resolve_relative_import(rel, imp)
            if not resolved:
                continue

            possible = [
                resolved,
                resolved + ".ts",
                resolved + ".tsx",
                resolved + ".js",
                resolved + ".jsx",
                resolved + ".py",
                resolved + "/index.ts",
                resolved + "/index.tsx",
                resolved + "/index.js",
                resolved + "/index.jsx",
                resolved + "/__init__.py",
            ]
            match = next((p for p in possible if p in repo_paths), None)
            if match:
                imported_by[match].add(rel)

    literal_reference_counts = find_literal_path_references(texts, repo_paths)

    records: List[FileRecord] = []

    for rel, text in texts.items():
        legacy_score, legacy_hits = score_keywords(text, LEGACY_KEYWORDS)
        mineral_score, mineral_hits = score_keywords(text, MINERALVIEW_KEYWORDS)

        import_count = len(imports_map.get(rel, []))
        imported_by_count = len(imported_by.get(rel, set()))
        literal_reference_count = literal_reference_counts.get(rel, 0)

        reasons: List[str] = []
        classification = "review"

        is_entrypoint_like = (
            Path(rel).name in ENTRYPOINT_HINTS
            or "/app/" in rel
            or "/pages/" in rel
            or rel.endswith("/page.tsx")
            or rel.endswith("/layout.tsx")
            or rel.endswith("router.py")
            or rel.endswith("main.py")
            or rel.endswith("server.py")
        )

        lower_rel = rel.lower()

        # Conservative keep signals
        if is_entrypoint_like:
            reasons.append("entrypoint-like file")
        if path_hint_contains(lower_rel, SAFE_KEEP_PATH_HINTS):
            reasons.append("path suggests MineralView-useful functionality")
        if mineral_score > legacy_score and mineral_score >= 4:
            reasons.append("contains MineralView-relevant signals")
        if imported_by_count > 0:
            reasons.append(f"imported by {imported_by_count} file(s)")
        if literal_reference_count > 2:
            reasons.append(f"referenced elsewhere {literal_reference_count} time(s)")

        # Dead / removal candidate heuristics
        dead_like = (
            imported_by_count == 0
            and literal_reference_count == 0
            and not is_entrypoint_like
        )

        strong_legacy = legacy_score >= 8 and mineral_score == 0
        mixed_legacy = legacy_score >= 4 and mineral_score < legacy_score

        if dead_like and strong_legacy:
            classification = "remove_candidate"
            reasons.append("unreferenced and strongly legacy-specific")
        elif dead_like and mixed_legacy:
            classification = "isolate"
            reasons.append("unreferenced and appears legacy-oriented")
        elif strong_legacy and imported_by_count > 0:
            classification = "isolate"
            reasons.append("still used but strongly legacy-specific")
        elif dead_like:
            classification = "review"
            reasons.append("unreferenced; may be dead code or manually-invoked")
        elif mineral_score > 0 and legacy_score == 0:
            classification = "keep"
        elif path_hint_contains(lower_rel, ["mortgage", "loan", "ownerrez", "vacation", "clickengine"]):
            classification = "isolate"
            reasons.append("legacy-domain path naming")
        else:
            classification = "review"

        # Extra keep protection for docs/config roots
        if any(seg in lower_rel for seg in ["constitution", "readme", "docs/", "docs\\"]):
            if classification == "remove_candidate":
                classification = "review"
                reasons.append("documentation should be reviewed manually, not auto-removed")

        if any(seg in lower_rel for seg in ["stripe", "billing", "seo", "blog", "faq", "persona", "campaign"]):
            if classification == "remove_candidate":
                classification = "review"
                reasons.append("growth/billing file may still be strategically important")

        record = FileRecord(
            path=rel,
            extension=meta[rel]["extension"],
            size_bytes=meta[rel]["size_bytes"],
            line_count=meta[rel]["line_count"],
            sha256=meta[rel]["sha256"],
            imports=imports_map.get(rel, []),
            exports=exports_map.get(rel, []),
            import_count=import_count,
            imported_by_count=imported_by_count,
            literal_reference_count=literal_reference_count,
            legacy_score=legacy_score,
            mineralview_score=mineral_score,
            legacy_hits=legacy_hits,
            mineralview_hits=mineral_hits,
            is_entrypoint_like=is_entrypoint_like,
            classification=classification,
            reasons=sorted(set(reasons)),
            preview=preview_text(text),
        )
        records.append(record)

    path_usage_map = {
        rec.path: sorted(list(imported_by.get(rec.path, set())))
        for rec in records
    }

    summary_counts = defaultdict(int)
    for rec in records:
        summary_counts[rec.classification] += 1

    return records, path_usage_map, dict(summary_counts)

# ----------------------------
# Reporting
# ----------------------------

def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")

def build_markdown_report(
    repo_root: str,
    records: List[FileRecord],
    summary_counts: Dict[str, int],
) -> str:
    lines: List[str] = []

    lines.append(f"# Repo Cleanup Analysis")
    lines.append("")
    lines.append(f"Repo: `{repo_root}`")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- keep: {summary_counts.get('keep', 0)}")
    lines.append(f"- review: {summary_counts.get('review', 0)}")
    lines.append(f"- isolate: {summary_counts.get('isolate', 0)}")
    lines.append(f"- remove_candidate: {summary_counts.get('remove_candidate', 0)}")
    lines.append("")

    lines.append("## Removal Candidates")
    lines.append("")
    remove_candidates = [r for r in records if r.classification == "remove_candidate"]
    if not remove_candidates:
        lines.append("No removal candidates found.")
        lines.append("")
    else:
        for rec in sorted(remove_candidates, key=lambda x: (-x.legacy_score, x.path)):
            lines.append(f"### `{rec.path}`")
            lines.append("")
            lines.append(f"- legacy_score: {rec.legacy_score}")
            lines.append(f"- mineralview_score: {rec.mineralview_score}")
            lines.append(f"- imported_by_count: {rec.imported_by_count}")
            lines.append(f"- literal_reference_count: {rec.literal_reference_count}")
            lines.append(f"- reasons: {', '.join(rec.reasons)}")
            if rec.legacy_hits:
                lines.append(f"- legacy_hits: {json.dumps(rec.legacy_hits, ensure_ascii=False)}")
            lines.append("")

    lines.append("## Isolate First")
    lines.append("")
    isolate_candidates = [r for r in records if r.classification == "isolate"]
    if not isolate_candidates:
        lines.append("No isolate candidates found.")
        lines.append("")
    else:
        for rec in sorted(isolate_candidates, key=lambda x: (-x.legacy_score, x.path)):
            lines.append(f"### `{rec.path}`")
            lines.append("")
            lines.append(f"- legacy_score: {rec.legacy_score}")
            lines.append(f"- mineralview_score: {rec.mineralview_score}")
            lines.append(f"- imported_by_count: {rec.imported_by_count}")
            lines.append(f"- reasons: {', '.join(rec.reasons)}")
            if rec.legacy_hits:
                lines.append(f"- legacy_hits: {json.dumps(rec.legacy_hits, ensure_ascii=False)}")
            lines.append("")

    lines.append("## Highest Legacy Score Files")
    lines.append("")
    for rec in sorted(records, key=lambda x: (-x.legacy_score, x.path))[:50]:
        if rec.legacy_score <= 0:
            continue
        lines.append(f"- `{rec.path}` — legacy_score={rec.legacy_score}, classification={rec.classification}")

    lines.append("")
    lines.append("## Notes")
    lines.append("")
    lines.append("- `remove_candidate` does not mean safe to delete without review.")
    lines.append("- `isolate` is usually the best first move for mortgage / vacation-rental / ClickEngine leftovers.")
    lines.append("- review all files tied to SEO, blogs, FAQs, personas, campaigns, billing, and AI generation before removing.")
    lines.append("- after this, the next step should be inserting findings into the Constitution and mapping keep/replace targets.")
    lines.append("")

    return "\n".join(lines)

# ----------------------------
# CLI
# ----------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze repo cleanup candidates.")
    parser.add_argument("repo_root", help="Path to repo root")
    parser.add_argument(
        "--output-dir",
        default="repo_cleanup_outputs",
        help="Directory for analysis outputs",
    )
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    if not repo_root.exists() or not repo_root.is_dir():
        raise SystemExit(f"Repo root does not exist or is not a directory: {repo_root}")

    records, path_usage_map, summary_counts = analyze_repo(repo_root)

    repo_index = [asdict(r) for r in records]
    removal_candidates = [
        asdict(r)
        for r in records
        if r.classification in {"remove_candidate", "isolate", "review"}
    ]

    write_json(output_dir / "repo_index.json", repo_index)
    write_json(output_dir / "path_usage_map.json", path_usage_map)
    write_json(output_dir / "removal_candidates.json", removal_candidates)
    write_json(output_dir / "summary_counts.json", summary_counts)

    md = build_markdown_report(str(repo_root), records, summary_counts)
    (output_dir / "removal_candidates.md").write_text(md, encoding="utf-8")

    print(f"Analysis complete.")
    print(f"Outputs written to: {output_dir}")
    print(f"Summary: {summary_counts}")

if __name__ == "__main__":
    main()