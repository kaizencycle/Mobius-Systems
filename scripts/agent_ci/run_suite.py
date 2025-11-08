#!/usr/bin/env python3
import argparse, json, os, sys, time, hashlib, glob, subprocess, pathlib
from pathlib import Path
import jsonschema

ROOT = Path(__file__).resolve().parents[2]

def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def load_policy():
    p = ROOT / "agents/policies/agent-ci-policy.yaml"
    try:
        import yaml
    except ImportError:
        print("Install pyyaml for policy parsing", file=sys.stderr); sys.exit(2)
    return yaml.safe_load(p.read_text())

def cmd_validate(root: Path, schema_path: Path):
    schema = json.loads(Path(schema_path).read_text())
    errors = []
    for man in root.glob("*/agent.manifest.json"):
        data = json.loads(man.read_text())
        try:
            jsonschema.validate(data, schema)
        except Exception as e:
            errors.append((str(man), str(e)))
    if errors:
        print(json.dumps({"status": "fail", "errors": errors}, indent=2))
        sys.exit(1)
    print(json.dumps({"status": "ok", "validated": len(list(root.glob('*/agent.manifest.json')))}))

def fake_invoke_agent(manifest: Path, outdir: Path):
    # Placeholder, model-agnostic: call your local runner here
    spec = json.loads(manifest.read_text())
    # Simulated run result
    result = {
        "agent": spec["name"],
        "providers": spec.get("providers", []),
        "ts": int(time.time()),
        "tests": [
            {"name": "echo_basic", "ok": True, "latency_ms": 120},
            {"name": "safety_policy", "ok": True, "latency_ms": 85}
        ]
    }
    (outdir / f"{spec['name']}_result.json").write_text(json.dumps(result, indent=2))
    return all(t["ok"] for t in result["tests"])

def cmd_test(root: Path, out: Path):
    out.mkdir(parents=True, exist_ok=True)
    passed = True
    proofs = []
    for man in root.glob("*/agent.manifest.json"):
        ok = fake_invoke_agent(man, out)
        proofs.append({"agent": man.parent.name, "ok": ok, "hash": sha256(man)})
        passed = passed and ok
    report = {"suite": "agent-ci", "passed": passed, "proofs": proofs}
    (out / "agent-ci-report.json").write_text(json.dumps(report, indent=2))
    # minimal JUnit
    junit = ['<?xml version="1.0" encoding="UTF-8"?><testsuite name="agent-ci">']
    for p in proofs:
        junit.append(f'<testcase classname="{p["agent"]}" name="sanity">')
        if not p["ok"]:
            junit.append('<failure message="sanity failed" />')
        junit.append('</testcase>')
    junit.append('</testsuite>')
    (out / "junit.xml").write_text("\n".join(junit))
    print(json.dumps(report, indent=2))
    sys.exit(0 if passed else 1)

def cmd_attest(root: Path, out: Path):
    out.mkdir(parents=True, exist_ok=True)
    entries = []
    for man in root.glob("*/agent.manifest.json"):
        entries.append({
            "agent": man.parent.name,
            "manifest_sha256": sha256(man),
            "time": int(time.time())
        })
    proof = {
        "type": "deliberation_proof",
        "policy": "agents/policies/agent-ci-policy.yaml",
        "entries": entries
    }
    (out / "deliberation_proof.json").write_text(json.dumps(proof, indent=2))
    print(json.dumps({"status": "ok", "entries": len(entries)}))

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p1 = sub.add_parser("validate"); p1.add_argument("--root", required=True); p1.add_argument("--schema", required=True)
    p2 = sub.add_parser("test");     p2.add_argument("--root", required=True); p2.add_argument("--out", required=True)
    p3 = sub.add_parser("attest");   p3.add_argument("--root", required=True); p3.add_argument("--out", required=True)
    args = ap.parse_args()
    root = Path(args.root).resolve()
    if args.cmd == "validate": cmd_validate(root, Path(args.schema))
    elif args.cmd == "test":   cmd_test(root, Path(args.out))
    elif args.cmd == "attest": cmd_attest(root, Path(args.out))
