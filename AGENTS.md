# Wine27: publication rules

This repository is the live public GitHub Pages site for Белый мыс2027. Publish edits to main after checking them. Do not delete events, descriptions, partners, or dates without an explicit user decision. Conference is transferred to2028 and must not return to2027.

Preserve stable event IDs and the local scenario storage key. Design uses ALS Hauss Next fonts and the brand palette. The default year view shows12months, large events and regular programs in plain language. Do not bring back the rejected matrix of conditional program lines or a fabricated overall workload score. Keep the staffing calculator collapsed by default.

Before every published content or design change run:

    python3 scripts/build-public.py
    python3 scripts/stamp-version.py
    node --check app.js
    node --check load.js
    node --check expert.js
    node --check expert-data.js
    node --check plan.js
    node --check planning-data.js
    node --check auto-update.js
    node --check program-guide.js
    node --check public-view.js
    node scripts/check-calendar.cjs
    node scripts/check-editions.cjs

Commit index.html and site-version.json from this run together with changed assets. The stamp is derived from asset contents; rerunning without changes preserves the release ID. Pages deploys main automatically. Verify the public site-version.json matches the release ID before reporting a version live.

Open pages poll every15seconds, wait for matching published HTML, retain view/month/filter/scroll, and preserve local calculations. Do not reload while a field is being edited. On local storage failure, ask the viewer to export the scenario rather than automatically reload and lose it. The first upgrade from a version without auto-update requires1manual refresh.

The working planning layer is private-work/planning-data.js. Preserve source dates in private-work/data.js; new proposed days, recurring rhythms, shared preparation and conditional projects must keep their statuses. The calendar includes embedded programs and dated residency slots, but the staffing model must not add a second shared production for them. Unknown opening dates stay unknown; readiness deadlines are separate.

Screen copy must use one heading per section. Do not repeat a navigation title in a large banner above the same heading. Descriptions should name the program, participants, location and material dependencies; omit generic benefits and introductory instructions. Put production details and source notes in disclosures. Preserve partners, dates and conditions when shortening copy.

Event scale is explicit in data.js. Big city weekends, festivals, major exhibitions and annual city celebrations must stay visible on the year map and in the dated calendar. In particular, craft is the large «Город мастеров» weekend, and exhibition titles are «Выставка современного искусства». Audit all months when changing scale. A large program nested in a season can be visually prominent without adding another shared production; keep displayTier separate from loadEventType for that case.

Month themes are the unifying context of the program. Keep them prominent above events in both year densities and the phone layout; make the existing detailed theme accessible from the banner. Do not hide themes in compact mode or duplicate them lower on the same month page. «Город мастеров» is positioned as a large weekend for men, with existing dates and scope preserved.

Use HURMA in every language and grammatical position. The change log is internal and has no site button or modal. Current working proposals redistribute «Резонанс» to 24–25 July and Голицынские дни to 2–3 October; previous dates are retained as provenance. There is exactly 1 large Central Bar party with Moscow artists in July and 1 in August (proposed 17 July / 14 August). «Винный Оскар» is a visually prominent grand finale inside Wine Week, not an additional shared production.

Calendar decisions from the latest user review: no special program on 9–10 January; keep the 20 February opening and May 1–10; remove partner-feb; May 9 is a separate quiet city celebration within May; retain June 14 daytime programming; Night of the Black Sea is October 30; November exhibition and Cinematica may run in parallel; the next New Year cycle ends January 8, 2028. Remaining professional questions are labelled «На согласовании». Preserve legal holiday dates separately from event choices.

Jazz residency scheduling: July and August use days free of major events, prioritising weekends with extra Tuesday–Friday evenings. No Mondays. Preserve club participation inside Resonance separately from standalone residencies. Weekday jazz must not displace Rotonda dance evenings; proposed dates do not confirm club bookings.

Published copy is a clean management document: describe the current program, dates, participants and material conditions only. Do not show editorial history (moved, retained from v10, removed, previous version, or references to chat decisions). Keep provenance in metadata and preserve genuine approval/booking statuses.

## Two editions and private access

The root site is an event calendar for the internal team: all events, residences, recurring formats and city rituals are included as the full planning scenario. Unfixed dates are labelled preliminary. Do not show the project catalogue, expert portfolio, operational questions, creation processes, source history or staffing calculations. Preserve every program item in the source; visibility rules do not mean cancellation.

/work/ is encrypted with a random 256-bit owner access key. Publish only work/index.html, work/lock.js, work/lock.css, work/payload.json and work/site-version.json there. Never publish plaintext working data, the key, private-work/ or a personal access URL. The public GitHub history predates this protection and is not made confidential retroactively.

Canonical sources are locally in private-work/data.js, private-work/expert-data.js, private-work/planning-data.js and private-work/index.html. They are persisted inside the encrypted payload. If missing, restore with scripts/unlock-work.py --key-file PATH. The key is held privately by the owner; it must never be printed in logs or committed. Do not overwrite or discard an existing key.

Build sequence: scripts/build-public.py, scripts/stamp-version.py, scripts/protect-work.py --key-file PATH, syntax checks, scripts/check-calendar.cjs, scripts/check-editions.cjs and scripts/check-protection.cjs PATH. Root data files are generated from private sources; update clean editorial overrides when program facts change.

Stamp and publish both pages and version files, encrypted payload and shared UI assets together. After deployment verify both editions and confirm work/data.js, work/planning-data.js and work/expert-data.js return 404. The presentation auto-update must never write the working staffing scenario.

Presentation weather copy: do not render seasonal operating instructions, indoor/outdoor fallback descriptions, weather thresholds or start-time rationale on the main team calendar. Keep weather planning in the encrypted working edition. Preserve concrete event venues, times and public holiday dates.

Team calendar header: omit the entire utility topbar, including the logo row, print/fullscreen/info buttons and visible auto-update status. The «Год города 2027» heading links to the initial year map, clears navigation filters/search and scrolls to the top. Automatic updates must continue without the status element. Keep working-edition controls and the existing private access intact.

Separate project conversations: the user requires a visible new chat that they can open and continue. An internal sub-agent does not create that chat; never describe it as a completed new-chat request. State a missing chat-creation capability plainly.

Team navigation has exactly 2 modes: «Год» (load) and «Месяц» (month). Year-map month headings and month selectors open the daily calendar directly. Resolve old public #year links to the year map and #load-month-N links to the corresponding daily month, including auto-update state. Preserve all events, dates, regular formats and rituals. Working-edition navigation and staffing details remain separate.

## Continuity before changes

The user requires every continuation to begin with an analysis of the work already completed. Before editing, inspect the latest user decisions, applicable source records, the current published revision and the relevant saved checkpoint. Preserve existing accepted work. Record the source and status of disputed content; a historical proposal or a prior assistant answer is not evidence of approval. Later direct user corrections take precedence. After changes, record what changed, why, where it was saved and what was actually verified live.

## Names page

/names/ is a separate mobile-first naming form, with a full desktop layout. Preserve its 16 place IDs, 48 inputs and localStorage key wine27.names.simple.v1. Do not restore the rejected multi-stage voting prototype. The reviewed examples are «Парусная» and «Бельведер», explicitly labelled «Прежние варианты». «Винный спуск» was rejected by the user for the example block. «Бельведер» belongs to the stairs to the wine school; it is not an additional place. «Ротонда» is the accepted base, with 1 additional word sought; «Белая ротонда» is rejected. Pier names remain earlier proposals; «18 закатов» is not an established local fact.

Keep collection disabled until an authorized, working intake exists. Do not simulate server receipt. The CSV download and participant card remain available. Preserve existing image captions that distinguish project visualizations and uncertain location matches. For names-only edits, preserve the main calendar release and publish names/index.html with its matching names/version.json atomically. Verify mobile and desktop rendering, retained drafts, and the deployed names version.

The user removed the hero paragraph «16 мест. По 3 идеи. Начните с любого.». Do not restore it or add replacement introductory copy unless requested.
