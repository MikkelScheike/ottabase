#!/usr/bin/env python3
"""
Substitute wrangler config placeholders with GitHub Actions secrets.

Used by deploy.yml (production) and pr-preview.yml (preview) to generate
temporary wrangler configs without modifying the source template.

Usage:
    MODE=production OUTPUT_FILE=wrangler.production.jsonc python substitute-wrangler-secrets.py
    MODE=preview OUTPUT_FILE=wrangler.preview.jsonc python substitute-wrangler-secrets.py

Required env vars:
    MODE           - "production" or "preview" (determines which placeholders to replace)
    WRANGLER_CONFIG - Input config path (e.g. wrangler.jsonc)
    OUTPUT_FILE     - Output path for generated config

Secrets (passed from workflow env):
    production: D1_DATABASE_ID, KV_NAMESPACE_ID, CLOUDFLARE_ACCOUNT_ID
    preview:    D1_PREVIEW_DATABASE_ID, KV_PREVIEW_NAMESPACE_ID, CLOUDFLARE_ACCOUNT_ID
"""

import os
import re
import sys
from pathlib import Path


# -----------------------------------------------------------------------------
# Replacement maps: placeholder -> env var name
# Add new placeholders here to keep the script dynamic
# -----------------------------------------------------------------------------
REPLACEMENTS = {
    "production": {
        "PRODUCTION_D1_DATABASE_ID": "D1_DATABASE_ID",
        "PRODUCTION_KV_NAMESPACE_ID": "KV_NAMESPACE_ID",
        "YOUR_CLOUDFLARE_ACCOUNT_ID": "CLOUDFLARE_ACCOUNT_ID",
    },
    "preview": {
        "PREVIEW_D1_DATABASE_ID": "D1_PREVIEW_DATABASE_ID",
        "PREVIEW_KV_NAMESPACE_ID": "KV_PREVIEW_NAMESPACE_ID",
        "YOUR_CLOUDFLARE_ACCOUNT_ID": "CLOUDFLARE_ACCOUNT_ID",
    },
}

# Patterns to detect if substitution left placeholders behind (mode-specific)
# Used for validation after substitution
REMAINING_PATTERNS = {
    "production": [r"PRODUCTION_D1_DATABASE_ID", r"PRODUCTION_KV_NAMESPACE_ID"],
    "preview": [r"PREVIEW_D1_DATABASE_ID", r"PREVIEW_KV_NAMESPACE_ID"],
}


def log(msg: str, stream=sys.stderr) -> None:
    """Print to stderr (workflow log)."""
    print(msg, file=stream)
    stream.flush()


def err_exit(msg: str, code: int = 1) -> None:
    """Log error and exit with code."""
    log(f"\n{msg}")
    sys.exit(code)


def main() -> None:
    mode = os.environ.get("MODE", "").strip().lower()
    if mode not in REPLACEMENTS:
        err_exit(
            f"❌ ERROR: MODE must be 'production' or 'preview', got: {mode!r}\n"
            "  Set MODE=production or MODE=preview when calling this script."
        )

    config_path = os.environ.get("WRANGLER_CONFIG", "wrangler.jsonc").strip()
    output_path = os.environ.get("OUTPUT_FILE", "").strip()
    if not output_path:
        default = "wrangler.production.jsonc" if mode == "production" else "wrangler.preview.jsonc"
        err_exit(
            f"❌ ERROR: OUTPUT_FILE is required.\n"
            f"  Example: OUTPUT_FILE={default}"
        )

    # Resolve paths relative to current working directory (apps/<folder> in workflows)
    input_file = Path(config_path)
    output_file = Path(output_path)

    if not input_file.exists():
        err_exit(
            f"❌ ERROR: Wrangler configuration file not found\n\n"
            f"  Expected: {input_file.absolute()}\n"
            f"  Current dir: {Path.cwd()}\n\n"
            "  Make sure your app has a wrangler.jsonc in its root."
        )

    # Build replacement dict: placeholder -> value from env
    replacements = REPLACEMENTS[mode]
    values = {}
    for placeholder, env_key in replacements.items():
        val = os.environ.get(env_key, "")
        values[placeholder] = val

    # Read, substitute, write
    content = input_file.read_text(encoding="utf-8")
    for placeholder, value in values.items():
        content = content.replace(placeholder, value)

    # Validate: no mode-specific placeholders should remain
    patterns = REMAINING_PATTERNS[mode]
    remaining = []
    for pat in patterns:
        if re.search(pat, content):
            remaining.append(pat)

    if remaining:
        err_exit(
            f"❌ ERROR: Secret substitution incomplete\n\n"
            f"  Placeholders still present: {', '.join(remaining)}\n\n"
            f"  Set the corresponding GitHub Secrets in repository settings.\n"
            f"  Production: D1_DATABASE_ID, KV_NAMESPACE_ID\n"
            f"  Preview: D1_PREVIEW_DATABASE_ID, KV_PREVIEW_NAMESPACE_ID"
        )

    # Basic JSON validity: output should contain valid structure
    if "{" not in content:
        err_exit(
            f"❌ ERROR: Generated config appears invalid\n\n"
            f"  Output does not contain valid JSON structure.\n"
            f"  Check source: {input_file}"
        )

    output_file.write_text(content, encoding="utf-8")
    log(f"✅ {mode.capitalize()} configuration generated successfully")
    log(f"📝 Output: {output_file}")


if __name__ == "__main__":
    main()
