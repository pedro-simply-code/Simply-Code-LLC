# Restore point (before site-wide Perfect Scrollbar)

Created when experimenting with `perfect-scrollbar` / `react-perfect-scrollbar`.

## Quick restore (PowerShell, repo root)

```powershell
./backups/pre-perfect-scrollbar/restore.ps1
```

## Manual restore

1. Copy backed-up files over the working tree:

   - `providers.tsx` → `src/providers/providers.tsx`
   - `globals.css` → `src/styles/globals.css`
   - `audit-log-dialog.tsx` → `src/components/studio/audit-log-dialog.tsx`
   - `layout.tsx` → `src/app/layout.tsx`
   - `package.json` → `package.json`

2. Remove scrollbar-only components (if present):

   - `src/components/perfect-scroll-area.tsx`
   - `src/components/site-scroll-root.tsx`

3. Reinstall deps from restored `package.json`:

   ```powershell
   pnpm install
   ```

4. Restart dev server.

## Git alternative

If you committed before the experiment, `git checkout -- <paths>` or reset the branch.
