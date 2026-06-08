# AgentDock Release Process

This document describes how to cut a release of AgentDock Desktop. It is
maintainer-facing; end users do not need to read it.

> Short version: bump `version` in `apps/desktop/package.json`, push a
> `vX.Y.Z` tag, and the GitHub Actions workflow does the rest. The
> Release is created as a **draft** so you can sanity-check the changelog
> and installers before publishing.

---

## 1. Pipeline at a glance

```
git tag v0.1.0 && git push --tags
            │
            ▼
   [preflight]   validate tag == package.json version
            │
       ┌────┼────────────────────┐
       ▼    ▼                    ▼
   [build-mac]  [build-win]  [build-linux]
   codesign +   signtool +   (optional) GPG
   notarize
       │            │             │
       └────────────┴─────────────┘
                    │
                    ▼
              [release]
            collect artifacts
            git-cliff → changelog
            create draft GitHub Release
            upload installers + latest*.yml
                    │
                    ▼
            maintainer reviews → Publish
```

The pipeline is defined in `.github/workflows/release.yml`. A lighter CI
workflow (`.github/workflows/ci.yml`) runs on every PR and push to `main`.

---

## 2. Required GitHub Secrets

All secrets live in **Settings → Secrets and variables → Actions**.

| Secret                       | Used by  | Purpose                                                                 |
| ---------------------------- | -------- | ----------------------------------------------------------------------- |
| `WINDOWS_CERT_FILE_BASE64`   | Windows  | Base64-encoded `.pfx` EV / OV code-signing certificate                  |
| `WINDOWS_CERT_PASSWORD`      | Windows  | Password for the `.pfx`                                                 |
| `MACOS_CERT_P12_BASE64`      | macOS    | Base64-encoded Developer ID Application `.p12`                          |
| `MACOS_CERT_P12_PASSWORD`    | macOS    | Password for the `.p12`                                                 |
| `MACOS_CERT_IDENTITY`        | macOS    | `Developer ID Application: <Name> (<TEAMID>)` — pass to `codesign`      |
| `APPLE_TEAM_ID`              | macOS    | 10-char Apple Developer Team ID (for notarization)                      |
| `APPLE_ID`                   | macOS    | Apple ID email used for notarization                                    |
| `APPLE_APP_SPECIFIC_PASSWORD`| macOS    | App-specific password generated at <https://appleid.apple.com/account/manage> |
| `LINUX_GPG_KEY_BASE64`       | Linux    | (Optional) Base64-encoded GPG private key for `deb`/`rpm` signing       |
| `LINUX_GPG_PASSPHRASE`       | Linux    | (Optional) Passphrase for the GPG key                                  |
| `GH_TOKEN`                   | All      | Auto-provided `GITHUB_TOKEN` is fine; use a PAT if you hit rate limits  |

> **Never commit certificates, passwords, or Apple credentials.** Only
> the CI runner should be able to decode them.

### How to encode a binary secret

```bash
# macOS
base64 -i cert.p12 -o cert.p12.b64
# Linux / WSL
base64 -w 0 cert.p12 > cert.p12.b64
# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cert.p12")) | Set-Content cert.p12.b64
```

Paste the contents of `*.b64` into the corresponding secret.

### How to obtain the certificates

- **Windows**: order an EV or OV certificate from DigiCert / Sectigo /
  GlobalSign. Export the chain as `.pfx` with a strong password. EV
  certificates also require an HSM or Azure Trusted Signing — see
  [Microsoft's docs](https://learn.microsoft.com/en-us/azure/trusted-signing/).
- **macOS**: enroll in the [Apple Developer Program](https://developer.apple.com/programs/)
  ($99/year). In Xcode → Settings → Accounts → Manage Certificates →
  create a **Developer ID Application** certificate, export as `.p12`,
  and copy the identity string from `security find-identity -p codesigning`.
- **Linux (optional)**: create a GPG key (`gpg --full-generate-key`),
  export the private key (`gpg --export-secret-keys --armor KEYID`),
  base64-encode the output.

---

## 3. Commit message convention

We use [Conventional Commits](https://www.conventionalcommits.org/). The
changelog is auto-generated from commit messages; if your commit does not
follow the convention, it will be silently dropped from the release notes.

| Prefix                | Lands in changelog section | Example                                              |
| --------------------- | -------------------------- | ---------------------------------------------------- |
| `feat:`               | 🚀 Features                | `feat(assets): add markdown editor for SKILL.md`    |
| `fix:`                | 🐛 Bug Fixes               | `fix(sync): preserve user content in AGENTS.md`      |
| `perf:`               | ⚡ Performance             | `perf(snapshot): lazy-load historical snapshots`     |
| `refactor:`           | 🔧 Refactoring             | `refactor(sync): split planner from executor`        |
| `docs:`               | 📚 Documentation           | `docs: document target adapter interface`            |
| `test:`               | 🧪 Testing                 | `test(merge): add conflict-detection cases`          |
| `build:`              | 🔨 Build System            | `build: pin electron-builder to 26.x`                |
| `ci:`                 | 🔄 CI/CD                   | `ci: cache pnpm store on release workflow`           |
| `chore:`              | 🧰 Chores                  | `chore: bump zustand to 5.0.14`                      |
| `feat!:` or `fix!:`   | marked **BREAKING**        | `feat(sync)!: drop v1 sync matrix schema`            |
| `feat(scope): … BREAKING CHANGE: …` | **BREAKING** in body | include footer line                  |

> Add a scope to make the changelog easier to scan.
> Use the imperative mood: `add`, not `added` or `adds`.

---

## 4. Cutting a release

```bash
# 1. Make sure you are on main and it is clean.
git checkout main
git pull --rebase
git status   # nothing uncommitted

# 2. Bump the version. Keep it in sync with the upcoming tag.
#    Patch  -> 0.0.1 (bug fixes)
#    Minor  -> 0.1.0 (new features, backwards-compatible)
#    Major  -> 1.0.0 (breaking changes)
pnpm version 0.1.0 --filter @agentdock/desktop

# 3. Push the version bump as its own commit.
git add apps/desktop/package.json
git commit -m "chore(release): bump to 0.1.0"
git push origin main

# 4. Tag and push. This triggers the release workflow.
git tag v0.1.0
git push origin v0.1.0
```

For a pre-release:

```bash
pnpm version 0.2.0-rc.1 --filter @agentdock/desktop
git tag v0.2.0-rc.1
git push origin main && git push origin v0.2.0-rc.1
```

The workflow detects the `-rc` / `-beta` / `-alpha` suffix and marks the
Release as a **prerelease** on GitHub, hiding it from the "Latest" badge.

### 5. Review and publish

1. Wait for the `release` workflow to finish (~10–15 min for all three
   platforms, signing + notarization included).
2. Open the **Draft Release** GitHub creates.
3. Read the auto-generated body — sanity-check the changelog sections.
4. Verify the asset list:
   - `AgentDock-0.1.0-x64.dmg`  +  `AgentDock-0.1.0-arm64.dmg`
   - `AgentDock-0.1.0-x64.exe`  (NSIS installer)
   - `AgentDock-0.1.0-x64.msi`
   - `AgentDock-0.1.0-x64.AppImage`  +  `.deb`  +  `.rpm`
   - `latest.yml`, `latest-mac.yml`, `latest-linux.yml` (auto-updater)
5. Click **Publish release**.

> If something is wrong, delete the failed tag locally and remotely
> (`git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`), fix it, and
> re-tag. The workflow is fully idempotent.

---

## 6. Auto-updater

`electron-updater` reads `latest*.yml` from the GitHub Release and shows
an in-app update prompt when a newer version is published. The metadata
is uploaded automatically by the release workflow.

Phase 1 wiring (to be done in the desktop app, not this workflow):

```ts
// apps/desktop/src/main/autoUpdate.ts
import { autoUpdater } from "electron-updater";

export function installAutoUpdate() {
  autoUpdater.logger = console;
  autoUpdater.checkForUpdatesAndNotify();
}
```

> **Note:** auto-update only works for **already-signed** builds. The
> first install after enabling signing still requires a manual download
> of the signed installer from the Release page.

---

## 7. Dry run

Want to validate the whole pipeline without producing a public Release?

1. Go to **Actions → release → Run workflow**.
2. Check **Dry run**.
3. The workflow runs every step except publishing the GitHub Release.
4. Inspect the artifacts under each job's summary.

---

## 8. Troubleshooting

| Symptom                                          | Likely cause                                          | Fix                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `tag v0.1.0 != package.json version 0.1.1`        | Forgot to bump version, or bumped the wrong field     | Run `pnpm version 0.1.0 --filter @agentdock/desktop`                                    |
| macOS job: `xcrun notarytool failed`              | Wrong app-specific password, or Apple ID not enrolled | Regenerate at <https://appleid.apple.com/account/manage>                                 |
| Windows job: `signtool` exits 1                  | Certificate expired or wrong password                 | Re-export `.pfx`, update `WINDOWS_CERT_FILE_BASE64` and `WINDOWS_CERT_PASSWORD`         |
| Linux job: no `latest-linux.yml` produced        | `publish: never` is set                                | This is expected — the file is still generated under `release/<version>/` and uploaded |
| Release is empty after workflow run              | `softprops/action-gh-release` could not find files    | Confirm the build jobs succeeded and uploaded artifacts                                 |
| Changelog missing a commit                       | Commit message did not follow Conventional Commits    | Re-word and `git commit --amend`, or add the commit hash manually to the draft          |

---

## 9. Migration to Tauri (future)

When we move from Electron to Tauri, the same workflow file is kept.
Only the `build-*` jobs change:

- `electron-builder` → `tauri build`
- Code signing moves from `signtool` / `codesign` to Tauri's
  `tauri.conf.json` signers (Azure Trusted Signing on Windows,
  `signingIdentity` on macOS, GPG on Linux)
- `latest*.yml` is replaced by Tauri updater's `update.json`

The Release job (artifact collection + `git-cliff` + `softprops/…`) does
not need to change at all.
