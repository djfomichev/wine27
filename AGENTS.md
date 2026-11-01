# Wine27: publication rules

This repository is the live public GitHub Pages site for Белый мыс2027. Publish edits to main after checking them. Do not delete events, descriptions, partners, or dates without an explicit user decision. Conference is transferred to2028 and must not return to2027.

Preserve stable event IDs and the local scenario storage key. Design uses ALS Hauss Next fonts and the brand palette. The default year view shows12months, large events and regular programs in plain language. Do not bring back the rejected matrix of conditional program lines or a fabricated overall workload score. Keep the staffing calculator collapsed by default.

Before every published content or design change run:

    python3 scripts/stamp-version.py
    node --check app.js
    node --check load.js
    node --check auto-update.js
    node scripts/check-calendar.cjs

Commit index.html and site-version.json from this run together with changed assets. The stamp is derived from asset contents; rerunning without changes preserves the release ID. Pages deploys main automatically. Verify the public site-version.json matches the release ID before reporting a version live.

Open pages poll every15seconds, wait for matching published HTML, retain view/month/filter/scroll, and preserve local calculations. Do not reload while a field is being edited. On local storage failure, ask the viewer to export the scenario rather than automatically reload and lose it. The first upgrade from a version without auto-update requires1manual refresh.
