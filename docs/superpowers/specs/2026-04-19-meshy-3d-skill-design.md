# meshy-3d Skill — Design

**Date:** 2026-04-19
**Status:** Approved, ready for implementation planning

## Purpose

A Claude Code skill that generates 3D assets via the Meshy API from either a text prompt or an image, and saves the resulting GLB file to a user-specified path. The skill is personal (installed under `~/.claude/skills/`), not project-specific, so it is available in any conversation.

## Scope

In scope:
- Text-to-3D generation via Meshy's `text-to-3d` endpoint
- Image-to-3D generation via Meshy's `image-to-3d` endpoint
- Preview and refine modes
- Common art style selection (realistic, cartoon, low-poly, sculpture, pbr)
- GLB download to an explicit output path

Out of scope (YAGNI):
- Automatic integration into HTML/JS (e.g. wiring into `<spline-viewer>`)
- Variant generation, remesh, retexture, rigging
- Non-GLB formats (FBX, OBJ, USDZ)
- Full passthrough of every Meshy parameter
- Interactive preview/approval loops

## Trigger

The skill's `description` frontmatter triggers Claude to invoke it when the user asks to:
- "generate a 3D model / asset / mesh"
- "text-to-3D" or "image-to-3D"
- anything mentioning Meshy

## Interface

When triggered, the skill instructs Claude to collect the following from the user:

| Input           | Required | Notes                                                                                      |
|-----------------|----------|--------------------------------------------------------------------------------------------|
| Input source    | Yes      | Either a text prompt OR a path/URL to an image. Skill routes based on which is provided.   |
| Output path     | Yes      | Explicit `.glb` destination. Claude infers from conversation context; no silent defaults.  |
| Art style       | No       | One of: `realistic` (default), `cartoon`, `low-poly`, `sculpture`, `pbr`.                  |
| Mode            | No       | `preview` (default, fast) or `refine` (higher quality; requires a prior preview task id).  |
| Preview task id | Only for refine | Required when `mode=refine`. Output of a prior preview run.                          |

Authentication: skill reads `MESHY_API_KEY` from the environment. If unset, the skill fails fast and instructs the user to `export MESHY_API_KEY=...`.

## Architecture

Two components:

### 1. `SKILL.md`
Location: `~/.claude/skills/meshy-3d/SKILL.md`.

Contains:
- Frontmatter with `name`, `description` (for trigger matching)
- Instructions for Claude on which inputs to collect and in what order
- The exact command form for invoking the helper script
- How to interpret each exit code and what to tell the user
- A note about `MESHY_API_KEY` and how to help the user set it if missing

### 2. `generate.py`
Location: `~/.claude/skills/meshy-3d/generate.py`.

A single Python script (stdlib only — `urllib`, `json`, `argparse`, `sys`, `time`, `pathlib`). No external dependencies.

Responsibilities:
1. Parse args: `--prompt` or `--image`, `--out`, `--style`, `--mode`, `--preview-task-id`
2. Read `MESHY_API_KEY` from env; exit 2 if missing
3. POST to the appropriate endpoint (`/openapi/v2/text-to-3d` for text, `/openapi/v1/image-to-3d` for image)
4. Poll the task status endpoint every 5s until status is `SUCCEEDED` or `FAILED`, with a 10-minute total timeout
5. On each poll, print one progress line to stdout (e.g., `status: IN_PROGRESS (45%)`) so Claude can relay it
6. On success, download the GLB from `model_urls.glb` to the user-specified output path
7. Print `saved: <absolute-path>` and exit 0

**Why Python over shell/curl:** stdlib handles HTTP, JSON polling, and file download cleanly without extra deps. Shell with `curl` + `jq` works but is awkward for polling loops and error handling. macOS ships Python 3 by default.

## Data Flow

```
user request
  → Claude asks for any missing inputs (prompt/image, output path, optional style/mode)
  → Claude runs: python3 ~/.claude/skills/meshy-3d/generate.py \
                   --image data/3d/Cyber_Fish.jpeg \
                   --out public/models/cyber-fish.glb \
                   --style realistic --mode preview
  → script validates env + args
  → POSTs to Meshy, receives task_id
  → polls every 5s, emits "status: IN_PROGRESS (n%)"
  → on SUCCEEDED, downloads GLB to --out path
  → prints "saved: /abs/path/cyber-fish.glb"
  → exits 0
```

## Error Handling

The helper script uses distinct exit codes so `SKILL.md` can tell Claude how to report each:

| Exit | Meaning                              | What Claude tells the user                                    |
|------|--------------------------------------|---------------------------------------------------------------|
| 0    | Success                              | "Saved GLB to `<path>`."                                      |
| 2    | `MESHY_API_KEY` not set              | "Set `MESHY_API_KEY` in your shell, then retry."              |
| 3    | Meshy API returned non-2xx           | Relay the status code and response body from stderr.          |
| 4    | Polling timeout (>10 min)            | "Generation timed out. Task id `<id>` may still complete."    |
| 5    | Output path unwritable               | "Can't write to `<path>`. Check the directory exists."        |
| 6    | `--mode refine` without task id      | "Refine requires `--preview-task-id`; run a preview first."   |

All non-zero exits print a diagnostic line to stderr.

## Testing

No automated tests. This is a thin API wrapper where the only meaningful behavior is the external API call; unit tests with mocks would test the mocks, not the integration.

Manual smoke tests (run once after implementation):
1. Text prompt → produces a valid GLB that opens in Blender or `<model-viewer>`
2. Image input (using `data/3d/Cyber_Fish.jpeg` from the current project) → produces a valid GLB
3. Refine mode using a task id from test 1 → produces a higher-quality GLB
4. Missing `MESHY_API_KEY` → exit 2 with clear message
5. Unwritable output path → exit 5 with clear message

## Open Questions

None. All knobs decided:
- Generator: Meshy
- Scope: generate-only (no integration, no refinement loop)
- Auth: env var `MESHY_API_KEY`
- Inputs: both text and image, auto-routed
- Output: user-specified path
- Options exposed: `art_style` and `mode` (preview/refine)
