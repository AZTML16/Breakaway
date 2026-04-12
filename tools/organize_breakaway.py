"""Split breakaway.html: css/app/breakaway.css + js/game/*.js. Run: python tools/organize_breakaway.py"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML_PATH = ROOT / "breakaway.html"


def main() -> None:
    text = HTML_PATH.read_text(encoding="utf-8")

    # CSS: team-logos link + style block -> keep logos + app/breakaway.css
    css_m = re.search(
        r'(<link rel="stylesheet" href="css/logos/team-logos.css">\n)<style>\n(.*?)\n</style>',
        text,
        re.DOTALL,
    )
    if not css_m:
        raise SystemExit("Expected css/logos/team-logos.css link + <style> block")
    app_css = ROOT / "css" / "app" / "breakaway.css"
    app_css.parent.mkdir(parents=True, exist_ok=True)
    app_css.write_text(css_m.group(2).strip() + "\n", encoding="utf-8", newline="\n")
    text = text[: css_m.start()] + css_m.group(1) + '<link rel="stylesheet" href="css/app/breakaway.css">\n' + text[css_m.end() :]

    comp_marker = '<script src="js/team-logos/composer.js"></script>'
    ic = text.find(comp_marker)
    if ic < 0:
        raise SystemExit("composer.js script tag not found")
    block_end = text.rfind("</script>", 0, ic)
    if block_end < 0:
        raise SystemExit("main script closing tag not found")
    block_start = text.find("<!-- Team crest modules:")
    if block_start < 0:
        raise SystemExit("Team crest comment not found")

    script = text[text.find("<script>", block_start) + len("<script>") : block_end].strip("\n")

    pattern = re.compile(r"^// ={50,}\n// (.+)\n// ={50,}\n", re.MULTILINE)
    matches = list(pattern.finditer(script))
    if not matches:
        raise SystemExit("No // === section headers in script")

    game_dir = ROOT / "js" / "game"
    game_dir.mkdir(parents=True, exist_ok=True)
    files: list[str] = []
    for idx, m in enumerate(matches):
        sec_start = m.start()
        sec_end = matches[idx + 1].start() if idx + 1 < len(matches) else len(script)
        title = m.group(1).strip()
        chunk = script[sec_start:sec_end].rstrip() + "\n"
        slug = re.sub(r"-+", "-", re.sub(r"[^\w]+", "-", title.lower()).strip("-"))[:50] or "section"
        fname = f"{idx:02d}-{slug}.js"
        (game_dir / fname).write_text(f"/* breakaway — {title} */\n{chunk}", encoding="utf-8", newline="\n")
        files.append(fname)

    script_tags = (
        "<!-- Team crest modules -->\n"
        '<script src="js/team-logos/shells.js"></script>\n'
        '<script src="js/team-logos/gfx-0.js"></script>\n'
        '<script src="js/team-logos/gfx-procedural.js"></script>\n'
        '<script src="js/team-logos/gfx-dispatch.js"></script>\n'
        "<!-- Game logic (order matters) -->\n"
        + "\n".join(f'<script src="js/game/{fn}"></script>' for fn in files)
        + "\n"
        + comp_marker
    )

    # Remove old block from crest comment through inline </script> (keep trailing newline before composer was)
    remainder = text[block_end + len("</script>") :].lstrip("\n\r")
    if remainder.startswith(comp_marker):
        remainder = remainder[len(comp_marker) :].lstrip("\n\r")
    new_text = text[:block_start] + script_tags + remainder
    HTML_PATH.write_text(new_text, encoding="utf-8", newline="\n")
    print("Wrote css/app/breakaway.css and", len(files), "modules under js/game/")


if __name__ == "__main__":
    main()
