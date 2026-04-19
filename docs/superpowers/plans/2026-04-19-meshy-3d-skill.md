# meshy-3d Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Claude Code skill (`~/.claude/skills/meshy-3d/`) that generates 3D GLB assets via the Meshy API from either a text prompt or an image, saving the output to a user-specified path.

**Architecture:** Two files — `SKILL.md` (instructions Claude reads when triggered) and `generate.py` (stdlib-only Python helper that calls Meshy's REST API, polls for completion, downloads the GLB). Auth via `MESHY_API_KEY` environment variable. Distinct exit codes map each failure mode to a specific user-facing message.

**Tech Stack:** Python 3 stdlib (`urllib`, `json`, `argparse`, `pathlib`, `time`, `sys`, `os`, `mimetypes`, `base64`). Meshy REST API v2 (text-to-3d) and v1 (image-to-3d). No third-party dependencies.

**Spec:** [docs/superpowers/specs/2026-04-19-meshy-3d-skill-design.md](../specs/2026-04-19-meshy-3d-skill-design.md)

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `~/.claude/skills/meshy-3d/SKILL.md` | Skill frontmatter + instructions Claude follows when the skill triggers. Defines input collection order, command form, and exit-code interpretation. |
| `~/.claude/skills/meshy-3d/generate.py` | CLI helper. Parses args, reads env, calls Meshy, polls status, downloads GLB. All logic in one file — ~200 lines, a thin API wrapper. |
| `~/.claude/skills/meshy-3d/tests/test_generate.py` | Unit tests for pure helper functions (arg parsing, exit-code routing, input-type detection). No tests that mock the Meshy API. |

Since Meshy is the thing being tested and mocks would verify nothing real, automated tests cover only the script's local logic. The API integration is validated by manual smoke tests in Task 7.

---

## Task 1: Scaffold skill directory with SKILL.md frontmatter

**Files:**
- Create: `~/.claude/skills/meshy-3d/SKILL.md`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p ~/.claude/skills/meshy-3d
```

- [ ] **Step 2: Write SKILL.md with frontmatter and placeholder body**

Write to `~/.claude/skills/meshy-3d/SKILL.md`:

```markdown
---
name: meshy-3d
description: Generate 3D GLB assets via the Meshy API from a text prompt or an image. Use when the user asks to generate a 3D model, 3D asset, 3D mesh, text-to-3D, image-to-3D, or mentions Meshy. Requires MESHY_API_KEY environment variable.
---

# meshy-3d

Generates 3D GLB assets via Meshy's REST API.

## When to use

Trigger when the user asks to generate a 3D model/asset/mesh, do text-to-3D or image-to-3D, or mentions Meshy.

## Inputs to collect from the user

Before running the helper, gather:

1. **Input source** (required): either a text prompt (string) OR a path/URL to an image file. If both are given, ask the user to pick one.
2. **Output path** (required): an explicit `.glb` file path. Do not invent one silently — infer from conversation context and confirm if unclear.
3. **Art style** (optional): one of `realistic` (default), `cartoon`, `low-poly`, `sculpture`, `pbr`.
4. **Mode** (optional): `preview` (default, fast) or `refine` (higher quality).
5. **Preview task id** (required only if `mode=refine`): the task id from a prior preview run.

## Environment

The helper reads `MESHY_API_KEY` from the environment. If the user has not set it, tell them:

```
export MESHY_API_KEY="your-key-here"
```

and suggest adding it to `~/.zshrc` for persistence.

## How to invoke the helper

For a text prompt:

```bash
python3 ~/.claude/skills/meshy-3d/generate.py \
  --prompt "<prompt text>" \
  --out "<output.glb>" \
  --style realistic \
  --mode preview
```

For an image:

```bash
python3 ~/.claude/skills/meshy-3d/generate.py \
  --image "<path-or-url>" \
  --out "<output.glb>" \
  --style realistic \
  --mode preview
```

For refine (after a prior preview):

```bash
python3 ~/.claude/skills/meshy-3d/generate.py \
  --prompt "<same or refined prompt>" \
  --out "<output.glb>" \
  --mode refine \
  --preview-task-id "<task-id-from-preview>"
```

The script prints progress lines like `status: IN_PROGRESS (45%)`. Relay those to the user so they know it's alive.

## Exit codes

| Exit | Meaning | What to tell the user |
|------|---------|-----------------------|
| 0    | Success | "Saved GLB to `<path>`." |
| 2    | `MESHY_API_KEY` not set | "Set `MESHY_API_KEY` in your shell, then retry." |
| 3    | Meshy API returned non-2xx | Relay status code and response body from stderr. |
| 4    | Polling timed out (>10 min) | "Generation timed out. Task id `<id>` may still complete — check Meshy dashboard." |
| 5    | Output path unwritable | "Can't write to `<path>`. Check the directory exists and is writable." |
| 6    | `--mode refine` without `--preview-task-id` | "Refine requires a preview task id. Run a preview first, then pass its task id." |
```

- [ ] **Step 3: Verify file exists and frontmatter is readable**

```bash
head -3 ~/.claude/skills/meshy-3d/SKILL.md
```

Expected output:
```
---
name: meshy-3d
description: Generate 3D GLB assets via the Meshy API from a text prompt or an image. Use when the user asks to generate a 3D model, 3D asset, 3D mesh, text-to-3D, image-to-3D, or mentions Meshy. Requires MESHY_API_KEY environment variable.
```

- [ ] **Step 4: Commit**

The skill lives under `~/.claude/` which is typically its own git repo (or no repo). Check first:

```bash
cd ~/.claude && git rev-parse --is-inside-work-tree 2>/dev/null
```

If the command prints `true`, commit:

```bash
cd ~/.claude && git add skills/meshy-3d/SKILL.md && git commit -m "feat(meshy-3d): scaffold skill with SKILL.md"
```

If not a git repo, skip the commit step and proceed.

---

## Task 2: Implement argument parsing and env check in generate.py

**Files:**
- Create: `~/.claude/skills/meshy-3d/generate.py`
- Test: `~/.claude/skills/meshy-3d/tests/test_generate.py`

- [ ] **Step 1: Create the test file with failing tests for arg parsing and env check**

Write to `~/.claude/skills/meshy-3d/tests/test_generate.py`:

```python
import os
import subprocess
import sys
from pathlib import Path

SCRIPT = Path(__file__).parent.parent / "generate.py"


def run(args, env=None):
    """Run the script with given args and env, return CompletedProcess."""
    full_env = os.environ.copy()
    if env is not None:
        # Replace (not merge) for deterministic tests
        full_env = {k: v for k, v in full_env.items() if k != "MESHY_API_KEY"}
        full_env.update(env)
    return subprocess.run(
        [sys.executable, str(SCRIPT)] + args,
        capture_output=True, text=True, env=full_env,
    )


def test_missing_api_key_exits_2():
    result = run(["--prompt", "a cube", "--out", "/tmp/x.glb"], env={})
    assert result.returncode == 2
    assert "MESHY_API_KEY" in result.stderr


def test_missing_input_source_exits_nonzero():
    result = run(["--out", "/tmp/x.glb"], env={"MESHY_API_KEY": "dummy"})
    assert result.returncode != 0


def test_missing_out_exits_nonzero():
    result = run(["--prompt", "a cube"], env={"MESHY_API_KEY": "dummy"})
    assert result.returncode != 0


def test_refine_without_preview_task_id_exits_6():
    result = run(
        ["--prompt", "a cube", "--out", "/tmp/x.glb", "--mode", "refine"],
        env={"MESHY_API_KEY": "dummy"},
    )
    assert result.returncode == 6
    assert "preview-task-id" in result.stderr or "preview task id" in result.stderr
```

- [ ] **Step 2: Run tests to confirm they fail (script doesn't exist yet)**

```bash
cd ~/.claude/skills/meshy-3d && python3 -m pytest tests/test_generate.py -v
```

Expected: all four tests FAIL (script file missing or does nothing useful).

If `pytest` isn't installed: `pip3 install pytest` first. If the user doesn't want pytest globally, we can fall back to a plain `python3 tests/test_generate.py` harness in Step 3 — but pytest is the assumed tool here.

- [ ] **Step 3: Write minimal generate.py with arg parsing, env check, refine guard**

Write to `~/.claude/skills/meshy-3d/generate.py`:

```python
#!/usr/bin/env python3
"""Generate a 3D GLB via the Meshy API. See SKILL.md for usage."""

import argparse
import os
import sys


EXIT_OK = 0
EXIT_NO_KEY = 2
EXIT_API_ERROR = 3
EXIT_TIMEOUT = 4
EXIT_UNWRITABLE = 5
EXIT_REFINE_NO_TASK = 6


def parse_args(argv):
    p = argparse.ArgumentParser(description="Generate a 3D GLB via Meshy.")
    src = p.add_mutually_exclusive_group(required=True)
    src.add_argument("--prompt", help="Text prompt for text-to-3D.")
    src.add_argument("--image", help="Path or URL to an image for image-to-3D.")
    p.add_argument("--out", required=True, help="Output .glb path.")
    p.add_argument(
        "--style",
        default="realistic",
        choices=["realistic", "cartoon", "low-poly", "sculpture", "pbr"],
    )
    p.add_argument("--mode", default="preview", choices=["preview", "refine"])
    p.add_argument("--preview-task-id", dest="preview_task_id", default=None)
    return p.parse_args(argv)


def main(argv):
    args = parse_args(argv)

    api_key = os.environ.get("MESHY_API_KEY")
    if not api_key:
        print("error: MESHY_API_KEY is not set in the environment.", file=sys.stderr)
        return EXIT_NO_KEY

    if args.mode == "refine" and not args.preview_task_id:
        print(
            "error: --mode refine requires --preview-task-id from a prior preview run.",
            file=sys.stderr,
        )
        return EXIT_REFINE_NO_TASK

    # Subsequent tasks implement the actual API call.
    print("error: not yet implemented", file=sys.stderr)
    return EXIT_API_ERROR


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Make it executable:

```bash
chmod +x ~/.claude/skills/meshy-3d/generate.py
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd ~/.claude/skills/meshy-3d && python3 -m pytest tests/test_generate.py -v
```

Expected: all four tests PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude && git add skills/meshy-3d/generate.py skills/meshy-3d/tests/test_generate.py && git commit -m "feat(meshy-3d): arg parsing, env check, refine guard" 2>/dev/null || true
```

---

## Task 3: Add HTTP helpers (POST JSON, GET JSON, download binary)

**Files:**
- Modify: `~/.claude/skills/meshy-3d/generate.py`

These are internal helpers. We don't unit-test them because any test would just mock `urllib` — meaningless. They're exercised by the smoke tests in Task 7.

- [ ] **Step 1: Add helpers above `main()` in generate.py**

Insert after the exit-code constants, before `parse_args`:

```python
import json
import urllib.error
import urllib.request
from pathlib import Path


MESHY_BASE = "https://api.meshy.ai"


def _auth_headers(api_key):
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def post_json(url, api_key, payload):
    """POST JSON, return parsed response dict. Raises on non-2xx."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=_auth_headers(api_key), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} from {url}: {body}") from e


def get_json(url, api_key):
    """GET JSON, return parsed response dict. Raises on non-2xx."""
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {api_key}"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} from {url}: {body}") from e


def download(url, out_path):
    """Download a binary URL to out_path. Creates parent dir if missing."""
    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    try:
        with urllib.request.urlopen(url, timeout=300) as resp, open(out, "wb") as f:
            while True:
                chunk = resp.read(65536)
                if not chunk:
                    break
                f.write(chunk)
    except OSError as e:
        raise PermissionError(f"cannot write to {out}: {e}") from e
```

- [ ] **Step 2: Verify the script still runs (no syntax errors)**

```bash
python3 -c "import ast; ast.parse(open('/Users/diky/../../.claude/skills/meshy-3d/generate.py').read())" 2>/dev/null || python3 -c "import ast; ast.parse(open(open('/dev/null').name) if False else open('$HOME/.claude/skills/meshy-3d/generate.py').read())"
```

Simpler check:
```bash
python3 -m py_compile ~/.claude/skills/meshy-3d/generate.py
echo "exit=$?"
```

Expected: `exit=0`.

- [ ] **Step 3: Run existing tests to verify nothing regressed**

```bash
cd ~/.claude/skills/meshy-3d && python3 -m pytest tests/test_generate.py -v
```

Expected: all four tests still PASS.

- [ ] **Step 4: Commit**

```bash
cd ~/.claude && git add skills/meshy-3d/generate.py && git commit -m "feat(meshy-3d): add urllib-based HTTP helpers" 2>/dev/null || true
```

---

## Task 4: Implement the polling loop

**Files:**
- Modify: `~/.claude/skills/meshy-3d/generate.py`

- [ ] **Step 1: Add `poll_until_done` helper below the HTTP helpers**

Insert after `download()`:

```python
import time


POLL_INTERVAL_SEC = 5
POLL_TIMEOUT_SEC = 600  # 10 minutes


def poll_until_done(task_url, api_key, progress=print):
    """Poll a Meshy task until SUCCEEDED or FAILED. Returns the final task dict.

    Raises TimeoutError after POLL_TIMEOUT_SEC.
    Raises RuntimeError if the task status is FAILED or EXPIRED.
    """
    start = time.monotonic()
    last_pct = -1
    while True:
        task = get_json(task_url, api_key)
        status = task.get("status", "UNKNOWN")
        pct = task.get("progress", 0)
        if pct != last_pct:
            progress(f"status: {status} ({pct}%)")
            last_pct = pct

        if status == "SUCCEEDED":
            return task
        if status in ("FAILED", "EXPIRED", "CANCELED"):
            err = task.get("task_error", {}).get("message", "no error message")
            raise RuntimeError(f"task {status}: {err}")

        if time.monotonic() - start > POLL_TIMEOUT_SEC:
            task_id = task.get("id", "?")
            raise TimeoutError(f"polling timed out after {POLL_TIMEOUT_SEC}s (task_id={task_id})")

        time.sleep(POLL_INTERVAL_SEC)
```

Note: `import time` already added; remove the duplicate if present.

- [ ] **Step 2: Verify script still compiles**

```bash
python3 -m py_compile ~/.claude/skills/meshy-3d/generate.py && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Run existing tests**

```bash
cd ~/.claude/skills/meshy-3d && python3 -m pytest tests/test_generate.py -v
```

Expected: all four tests PASS.

- [ ] **Step 4: Commit**

```bash
cd ~/.claude && git add skills/meshy-3d/generate.py && git commit -m "feat(meshy-3d): add polling loop with timeout" 2>/dev/null || true
```

---

## Task 5: Wire up text-to-3D and image-to-3D flows

**Files:**
- Modify: `~/.claude/skills/meshy-3d/generate.py`

- [ ] **Step 1: Add `is_url` and `encode_image_to_data_uri` helpers**

Insert after the HTTP helpers (before `poll_until_done`):

```python
import base64
import mimetypes


def is_url(s):
    return s.startswith("http://") or s.startswith("https://")


def encode_image_to_data_uri(image_path):
    """Read a local image file and return a data URI string Meshy accepts."""
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"image not found: {image_path}")
    mime, _ = mimetypes.guess_type(str(path))
    if mime is None:
        mime = "image/jpeg"
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{b64}"
```

- [ ] **Step 2: Add `run_text_to_3d` and `run_image_to_3d` functions**

Insert before `main()`:

```python
def run_text_to_3d(api_key, prompt, style, mode, preview_task_id, out_path, progress=print):
    url = f"{MESHY_BASE}/openapi/v2/text-to-3d"
    payload = {
        "mode": mode,
        "prompt": prompt,
        "art_style": style,
    }
    if mode == "refine":
        payload["preview_task_id"] = preview_task_id

    progress(f"submitting text-to-3d ({mode}, {style})...")
    resp = post_json(url, api_key, payload)
    task_id = resp.get("result") or resp.get("id")
    if not task_id:
        raise RuntimeError(f"no task id in response: {resp}")
    progress(f"task_id: {task_id}")

    task = poll_until_done(f"{url}/{task_id}", api_key, progress=progress)
    glb_url = task.get("model_urls", {}).get("glb")
    if not glb_url:
        raise RuntimeError(f"no glb url in completed task: {task}")

    progress(f"downloading glb -> {out_path}")
    download(glb_url, out_path)
    progress(f"saved: {Path(out_path).resolve()}")
    return task_id


def run_image_to_3d(api_key, image, style, mode, preview_task_id, out_path, progress=print):
    url = f"{MESHY_BASE}/openapi/v1/image-to-3d"
    image_field = image if is_url(image) else encode_image_to_data_uri(image)
    payload = {
        "image_url": image_field,
        "art_style": style,
        # image-to-3d uses enable_pbr rather than a mode switch; pass through style.
    }
    progress(f"submitting image-to-3d ({style})...")
    resp = post_json(url, api_key, payload)
    task_id = resp.get("result") or resp.get("id")
    if not task_id:
        raise RuntimeError(f"no task id in response: {resp}")
    progress(f"task_id: {task_id}")

    task = poll_until_done(f"{url}/{task_id}", api_key, progress=progress)
    glb_url = task.get("model_urls", {}).get("glb")
    if not glb_url:
        raise RuntimeError(f"no glb url in completed task: {task}")

    progress(f"downloading glb -> {out_path}")
    download(glb_url, out_path)
    progress(f"saved: {Path(out_path).resolve()}")
    return task_id
```

Note: `mode` and `preview_task_id` are ignored by `run_image_to_3d` because Meshy's v1 image-to-3d endpoint doesn't use the preview/refine split. We accept them in the signature so `main()` can dispatch uniformly — keeps the call site simple.

- [ ] **Step 3: Replace the placeholder at the bottom of `main()`**

Find in `main()`:

```python
    # Subsequent tasks implement the actual API call.
    print("error: not yet implemented", file=sys.stderr)
    return EXIT_API_ERROR
```

Replace with:

```python
    try:
        if args.prompt:
            run_text_to_3d(
                api_key, args.prompt, args.style, args.mode,
                args.preview_task_id, args.out,
            )
        else:
            run_image_to_3d(
                api_key, args.image, args.style, args.mode,
                args.preview_task_id, args.out,
            )
    except TimeoutError as e:
        print(f"error: {e}", file=sys.stderr)
        return EXIT_TIMEOUT
    except PermissionError as e:
        print(f"error: {e}", file=sys.stderr)
        return EXIT_UNWRITABLE
    except (RuntimeError, FileNotFoundError, urllib.error.URLError) as e:
        print(f"error: {e}", file=sys.stderr)
        return EXIT_API_ERROR

    return EXIT_OK
```

- [ ] **Step 4: Verify script compiles**

```bash
python3 -m py_compile ~/.claude/skills/meshy-3d/generate.py && echo OK
```

Expected: `OK`.

- [ ] **Step 5: Run existing tests**

```bash
cd ~/.claude/skills/meshy-3d && python3 -m pytest tests/test_generate.py -v
```

Expected: all four tests still PASS (the new code path isn't exercised without a real API key, but the arg-parsing/env-check tests still cover their branches).

- [ ] **Step 6: Commit**

```bash
cd ~/.claude && git add skills/meshy-3d/generate.py && git commit -m "feat(meshy-3d): wire up text-to-3d and image-to-3d flows" 2>/dev/null || true
```

---

## Task 6: Add unit tests for pure helpers

**Files:**
- Modify: `~/.claude/skills/meshy-3d/tests/test_generate.py`

Covers the logic that doesn't touch the network.

- [ ] **Step 1: Append tests for `is_url` and `encode_image_to_data_uri`**

Append to `~/.claude/skills/meshy-3d/tests/test_generate.py`:

```python
import importlib.util
import tempfile

spec = importlib.util.spec_from_file_location("generate", SCRIPT)
generate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generate)


def test_is_url_true_for_http_and_https():
    assert generate.is_url("http://example.com/x.jpg")
    assert generate.is_url("https://example.com/x.jpg")


def test_is_url_false_for_local_path():
    assert not generate.is_url("/tmp/x.jpg")
    assert not generate.is_url("./x.jpg")
    assert not generate.is_url("x.jpg")


def test_encode_image_to_data_uri_roundtrip(tmp_path):
    p = tmp_path / "pixel.jpg"
    # Minimal valid-looking bytes; mime is inferred from extension.
    p.write_bytes(b"\xff\xd8\xff\xd9")
    uri = generate.encode_image_to_data_uri(str(p))
    assert uri.startswith("data:image/jpeg;base64,")
    import base64
    payload = uri.split(",", 1)[1]
    assert base64.b64decode(payload) == b"\xff\xd8\xff\xd9"


def test_encode_image_to_data_uri_missing_file():
    import pytest
    with pytest.raises(FileNotFoundError):
        generate.encode_image_to_data_uri("/nonexistent/does-not-exist.jpg")
```

- [ ] **Step 2: Run the full test suite**

```bash
cd ~/.claude/skills/meshy-3d && python3 -m pytest tests/test_generate.py -v
```

Expected: 8 tests PASS (4 from Task 2 + 4 new).

- [ ] **Step 3: Commit**

```bash
cd ~/.claude && git add skills/meshy-3d/tests/test_generate.py && git commit -m "test(meshy-3d): cover is_url and encode_image_to_data_uri" 2>/dev/null || true
```

---

## Task 7: Manual smoke tests

**Files:** none created; exercises the real API.

Run these by hand. Each assumes `MESHY_API_KEY` is exported.

- [ ] **Step 1: Confirm API key is set**

```bash
test -n "$MESHY_API_KEY" && echo "key set" || echo "NOT SET"
```

Expected: `key set`. If not, have the user set it before continuing.

- [ ] **Step 2: Missing-key path (exit 2)**

```bash
env -u MESHY_API_KEY python3 ~/.claude/skills/meshy-3d/generate.py --prompt "a cube" --out /tmp/x.glb
echo "exit=$?"
```

Expected: stderr mentions `MESHY_API_KEY`, `exit=2`.

- [ ] **Step 3: Refine without task id (exit 6)**

```bash
python3 ~/.claude/skills/meshy-3d/generate.py --prompt "a cube" --out /tmp/x.glb --mode refine
echo "exit=$?"
```

Expected: stderr mentions `--preview-task-id`, `exit=6`.

- [ ] **Step 4: Text-to-3D preview (real API call)**

```bash
python3 ~/.claude/skills/meshy-3d/generate.py \
  --prompt "a low-poly purple crystal" \
  --out /tmp/meshy-smoke-text.glb \
  --style low-poly --mode preview
echo "exit=$?"
ls -l /tmp/meshy-smoke-text.glb
```

Expected: progress lines stream, `exit=0`, file exists and is > 10KB. Opens in Blender or https://modelviewer.dev/editor.

- [ ] **Step 5: Image-to-3D (real API call, using the project's Cyber_Fish image)**

```bash
python3 ~/.claude/skills/meshy-3d/generate.py \
  --image /Users/diky/Documents/landing-page-try/data/3d/Cyber_Fish.jpeg \
  --out /tmp/meshy-smoke-fish.glb \
  --style realistic
echo "exit=$?"
ls -l /tmp/meshy-smoke-fish.glb
```

Expected: `exit=0`, file exists. Opens in a GLB viewer.

- [ ] **Step 6: Unwritable output path (exit 5)**

```bash
python3 ~/.claude/skills/meshy-3d/generate.py \
  --prompt "a cube" \
  --out /this/path/does/not/exist/and/cannot/be/made/because/root/x.glb
echo "exit=$?"
```

Expected: stderr complains about writing; `exit=5`.

Note: `download()` calls `parent.mkdir(parents=True, exist_ok=True)` — a path like `/root/...` (no write permission) is a more reliable way to trigger exit 5 than a deep non-existent path. If running as a regular user, `/private/var/root/x.glb` or similar should do.

- [ ] **Step 7: Report results**

If all six checks pass, the skill is verified end-to-end. If any fail, file the failure details and fix before claiming complete.

No commit in this task — nothing changed on disk.

---

## Self-Review

**Spec coverage:**
- Trigger wording → Task 1 (SKILL.md `description`)
- Input collection (prompt/image, out, style, mode, preview-task-id) → Task 2 (arg parsing)
- `MESHY_API_KEY` env → Task 2 (env check, exit 2)
- Text-to-3D endpoint → Task 5 (`run_text_to_3d`)
- Image-to-3D endpoint → Task 5 (`run_image_to_3d`, both URL and local path)
- Polling every 5s with 10min timeout → Task 4 (`poll_until_done`)
- Progress lines to stdout → Task 4 (`progress(...)`) and Task 5 (invocations)
- GLB download to user-specified path → Task 5 via `download()` from Task 3
- Exit codes 0/2/3/4/5/6 → Task 2 (constants + 2,6) and Task 5 (3,4,5)
- Manual smoke tests → Task 7

**Placeholder scan:** no "TBD", "TODO", "appropriate error handling", or implement-later text. Every code step contains runnable code.

**Type consistency:** `task_id`, `glb_url`, `progress`, `api_key`, `out_path` names match across Tasks 3–5. Exit-code constants defined once in Task 2 and referenced by name thereafter. `poll_until_done(task_url, api_key, progress=print)` signature in Task 4 matches the call sites in Task 5.

No gaps found. Plan is ready.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-19-meshy-3d-skill.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
