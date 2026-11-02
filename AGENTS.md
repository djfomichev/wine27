# Wine27: publication rules

This repository is the live public GitHub Pages site for Белый мыс2027. Publish edits to main after checking them. Do not delete events, descriptions, partners, or dates without an explicit user decision. Conference is transferred to2028 and must not return to2027.

Preserve stable event IDs and the local scenario storage key. Design uses ALS Hauss Next fonts and the brand palette. The default year view shows12months, large events and regular programs in plain language. Do not bring back the rejected matrix of conditional program lines or a fabricated overall workload score. Keep the staffing calculator collapsed by default.

Before every published content or design change run:

    python3 scripts/stamp-version.py
    node --check app.js
    node --check load.js
    node --check expert.js
    node --check expert-data.js
    node --check plan.js
    node --check planning-data.js
    node --check auto-update.js
    node scripts/check-calendar.cjs

Commit index.html and site-version.json from this run together with changed assets. The stamp is derived from asset contents; rerunning without changes preserves the release ID. Pages deploys main automatically. Verify the public site-version.json matches the release ID before reporting a version live.

Open pages poll every15seconds, wait for matching published HTML, retain view/month/filter/scroll, and preserve local calculations. Do not reload while a field is being edited. On local storage failure, ask the viewer to export the scenario rather than automatically reload and lose it. The first upgrade from a version without auto-update requires1manual refresh.

The working planning layer is planning-data.js. Preserve source dates in data.js; new proposed days, recurring rhythms, shared preparation and conditional projects must keep their statuses. The calendar includes embedded programs and dated residency slots, but the staffing model must not add a second shared production for them. Unknown opening dates stay unknown; readiness deadlines are separate.

Screen copy must use one heading per section. Do not repeat a navigation title in a large banner above the same heading. Descriptions should name the program, participants, location and material dependencies; omit generic benefits and introductory instructions. Put production details and source notes in disclosures. Preserve partners, dates and conditions when shortening copy.

Event scale is explicit in data.js. Big city weekends, festivals, major exhibitions and annual city celebrations must stay visible on the year map and in the dated calendar. In particular, craft is the large «Город мастеров» weekend, and exhibition titles are «Выставка современного искусства». Audit all months when changing scale. A large program nested in a season can be visually prominent without adding another shared production; keep displayTier separate from loadEventType for that case.

Month themes are the unifying context of the program. Keep them prominent above events in both year densities and the phone layout; make the existing detailed theme accessible from the banner. Do not hide themes in compact mode or duplicate them lower on the same month page. «Город мастеров» is positioned as a large weekend for men, with existing dates and scope preserved.

Use HURMA in every language and grammatical position. The change log is internal and has no site button or modal. Current working proposals redistribute «Резонанс» to 24–25 July and Голицынские дни to 2–3 October; previous dates are retained as provenance. There is exactly 1 large Central Bar party with Moscow artists in July and 1 in August (proposed 17 July / 14 August). «Винный Оскар» is a visually prominent grand finale inside Wine Week, not an additional shared production.

Calendar decisions from the latest user review: no special program on 9–10 January; keep the 20 February opening and May 1–10; remove partner-feb; May 9 is a separate quiet city celebration within May; retain June 14 daytime programming; Night of the Black Sea is October 30; November exhibition and Cinematica may run in parallel; the next New Year cycle ends January 8, 2028. Remaining professional questions are labelled «На согласовании». Preserve legal holiday dates separately from event choices.

Jazz residency scheduling: July and August use days free of major events, prioritising weekends with extra Tuesday–Friday evenings. No Mondays. Preserve club participation inside Resonance separately from standalone residencies. Weekday jazz must not displace Rotonda dance evenings; proposed dates do not confirm club bookings.

Published copy is a clean management document: describe the current program, dates, participants and material conditions only. Do not show editorial history (moved, retained from v10, removed, previous version, or references to chat decisions). Keep provenance in metadata and preserve genuine approval/booking statuses.
