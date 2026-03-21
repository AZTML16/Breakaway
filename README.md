# Breakaway

Single-file hockey career sim (`breakaway.html`). Open `index.html` or `breakaway.html` in a browser (use **http**, not `file://`, for reliable Web Audio).

## Run locally (recommended)

```bash
npm start
```

Then open **http://localhost:3000** (serves `index.html` → `breakaway.html`).

Or without npm:

```bash
npx --yes serve . -l 3000
```

Python:

```bash
python -m http.server 3000
```

## Host on GitHub Pages

### 1. Create the repo on GitHub

1. Go to [github.com/new](https://github.com/new).
2. **Repository name**: e.g. `breakaway` (any name works).
3. Leave **Public** (GitHub Pages is free for public repos).
4. **Do not** add a README/license if you already have files locally — click **Create repository**.

### 2. Push your project from your PC

In a terminal, inside this folder (`Breakaway`):

```bash
git init
git add .
git commit -m "Add Breakaway game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with yours.

**Starting over (clean local Git):** if you already had a messy repo, you can wipe local Git history and commit once:

```powershell
cd path\to\Breakaway
Remove-Item -Recurse -Force .git   # Windows PowerShell
git init
git branch -M main
git add .
git commit -m "Initial commit: Breakaway"
```

Then add `origin` and `git push` as above. On GitHub you can delete the old repo and create a new empty one with the same name, or force-push (advanced).

### 3. Turn on GitHub Pages

1. On GitHub, open the repo → **Settings** (tab).
2. Left sidebar → **Pages** (under “Code and automation”).
3. **Build and deployment → Source**: choose **Deploy from a branch**.
4. **Branch**: `main`, **Folder**: `/ (root)` → **Save**.

Wait **1–2 minutes**. Refresh the Pages section — it will show **Your site is live at …**

### 4. Open the game

Your site URL will be:

```text
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

That loads `index.html`, which sends you to `breakaway.html`. You can also bookmark:

```text
https://YOUR_USERNAME.github.io/YOUR_REPO/breakaway.html
```

**Note:** The first deploy can take a few minutes. If you see 404, wait and hard-refresh (Ctrl+F5).

## Other hosts (optional)

### Netlify

1. [netlify.com](https://www.netlify.com) → **Add new site** → **Import an existing project** (Git) or **Deploy manually** (drag this folder).
2. **Publish directory**: `.` (root). `netlify.toml` is optional.
3. Your live URL will look like `https://random-name.netlify.app`.

### Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import this repo.
2. Framework: **Other**, root directory: `.`, no build command.
3. Deploy — you get a `*.vercel.app` URL.

---

Audio needs a **click/tap** once to unlock; hosting over **HTTPS** is fine.
