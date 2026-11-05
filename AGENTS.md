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

Team calendar header: omit the entire utility topbar, including the logo row, print/fullscreen/info buttons and visible auto-update status. The «Пульс города 2027» heading links to the initial year map, clears navigation filters/search and scrolls to the top. Automatic updates must continue without the status element. Keep working-edition controls and the existing private access intact.

Separate project conversations: the user requires a visible new chat that they can open and continue. An internal sub-agent does not create that chat; never describe it as a completed new-chat request. State a missing chat-creation capability plainly.

Team navigation has exactly 2 modes: «Год» (load) and «Месяц» (month). Year-map month headings and month selectors open the daily calendar directly. Resolve old public #year links to the year map and #load-month-N links to the corresponding daily month, including auto-update state. Preserve all events, dates, regular formats and rituals. Working-edition navigation and staffing details remain separate.

## Continuity before changes

The user requires every continuation to begin with an analysis of the work already completed. Before editing, inspect the latest user decisions, applicable source records, the current published revision and the relevant saved checkpoint. Preserve existing accepted work. Record the source and status of disputed content; a historical proposal or a prior assistant answer is not evidence of approval. Later direct user corrections take precedence. After changes, record what changed, why, where it was saved and what was actually verified live.

## Names page

/names/ is a separate mobile-first naming form, with a full desktop layout. Latest user corrections (5 November 2026): 15 active places and 45 inputs. Remove square-registry (Площадь у ЗАГСа) and lane-cross (Поперечный проход). Restore street-museum by the museum and Парадиз with working name «Улица Льва Голицына»; keep street-gastronomy separately. Add bridge-rooftop by the rooftop and restaurant Flagman, used for parties, and stairs-expo from Парадиз up to Expo near the Central Bar and «Горные ворота». No working names were supplied for the new bridge or stairs: show the naming brief without inventing earlier proposals. Preserve surviving IDs and localStorage key wine27.names.simple.v1. Keep restored museum drafts under their original ID; merge only the former alley, retaining overflow. Preserve already-merged v4/v5 drafts where they are without guessing their origins. Archive removed-place answers under their original IDs/titles and include them in CSV; never remap them to new places. The historical 16-place registry remains unchanged. Do not restore the rejected multi-stage voting prototype.

Every place card follows this order: place/photo, its role for the city, our previous naming proposals and why, then a request for the participant’s 3 variants. The separate «Как мы искали имена» example block was removed. Show each previous name only alongside its matching place. «Парусная» belongs to the enoteca stairs; «Бельведер» belongs to the wine-school stairs and is not an extra place. The latest direct user correction (4 November 2026) restores «Винный спуск» as the working name of the descent to the fountains; this overrides its earlier exclusion. «Ротонда» is the accepted base, with 1 additional word sought; «Белая ротонда» is rejected. Pier names remain proposals; «18 закатов» is not an established local fact.

Keep collection disabled until an authorized, working intake exists. Do not simulate server receipt. Only the CSV download remains available. The user explicitly removed ALL game mechanics: no levels, rewards, badges, completion counters/progress bars, participant cards, favorite-name selector, celebratory notifications, bonuses or stickers. Participation is optional. Retain the plain form, draft persistence and safe version updates. Preserve existing image captions that distinguish project visualizations and uncertain location matches. For names-only edits, preserve the main calendar release and publish names/index.html with its matching names/version.json atomically. Verify mobile and desktop rendering, retained drafts, and the deployed names version.

The user removed the hero paragraph «16 мест. По 3 идеи. Начните с любого.». Do not restore it or add replacement introductory copy unless requested.

Team calendar filters: «ВСЕ» is the first, larger control. Filters are independent additive selections: clicking adds/removes only that filter; combining categories and «Фестивали» shows their union without duplicate events. «ВСЕ» clears the selection; selecting none also shows all. Preserve selections across year/month navigation and automatic updates, including migration from the former single category. The public year map omits the color legend and the entire undated-events strip («События без точной даты» / «Конкурс названий города»); preserve source projects and the separate /names/ page.

The internal project name is «Пульс города 2027», including the site title, calendar masthead and working edition. The public masthead is compact: one title, update date, two compact navigation controls and search. Keep filters in their own stable row with room for reset, and avoid a separate release-date band. Regular programs follow the events in each month; do not push them to the bottom with an automatic spacer. Preserve the current branding, multi-select behavior and all program sources.

Names-page wording (4 November 2026): use «Рабочее название» wherever a sourced working name exists. Omit «Мы предлагали» and «Название пока не утверждено». Place headings are «Вход со стороны парковки», «Площадь с амфитеатром», «Левый пирс» and «Правый пирс у ЗАГСа». Keep the bell as a future idea in the left-pier explanation. The Rotonda is the round empty stage among the fountains: use the original photo without the proposed art object.

Calendar usability (4 November 2026): public desktop filters are large outlined multi-select buttons (18–20px, 54–58px targets); ВСЕ is first and larger. Selected categories share a black fill and checkmark. The public year heading «Карта года» is omitted; density is labelled «Подробно / Компактно» in the controls row. On phones, «Направления» explicitly expands all filters; selected filters remain visible when collapsed. Search exposes matching event and format titles directly, covers all recurring categories and embedded/dated slots, and shows one honest empty state. Preserve the default 12-month map. Month search uses direct results; clearing it returns the daily calendar. Seasonal formats without sessions show their source period, not fabricated dates. Keep dialog titles labelled/focused, return focus to month navigation, and postpone automatic updates while a dialog is open.

Latest direct correction (4 November 2026): omit event/regular-format counters and instructional filler beneath the public filters, including «Можно выбрать несколько направлений» and the repeated footer filter notice. Keep the functional reset/density controls and genuine empty-search message. Do not replace the removed text with another explanatory sentence.

Latest direct correction (4 November 2026): remove public «Подробно / Компактно» entirely. Use one full-width filter panel with ALL first, additive categories and an inline reset button, without a separate controls/status row or divider. The public year always uses the readable detail layout, including when restoring older compact state. Preserve the private working edition and public mobile filter expansion.

Month-jump selector wording (4 November 2026): its placeholder is «Месяц», not «Все 12 месяцев». This is a label change only; preserve the complete year and all 12 month options.

Mobile controls redesign (4 November 2026): compact phone masthead with title/year and search, no update date. One primary row: ВСЕ, Фильтры, Месяц. Keep the month selector in the same place in year and month modes; omit the old mobile month-jump and duplicate month toolbar. Native filter dialog opens as a bottom sheet with independent multi-select choices, close and Готово; apply immediately, preserve search when selecting ALL, retain selection on close/Escape. Selected chips remain visible and can be removed individually. Hide the redundant global reset on phones; keep search clear and desktop reset. Restore focus after removing a chip, keep the sheet scrollable with header/footer visible, postpone auto-update while either dialog is open. Preserve desktop filter panel, bottom Год/Месяц navigation, the complete 12-month year and all program data.

## v15 canonical program and presentation (4 November 2026)

The editable program is private-work/program.json, schema1. Preserve IDs,253 ledger records, archived exclusions, accepted concepts and separately unconfirmed dates/bookings. Root and private data.js/planning-data.js/expert-data.js are generated. Do not add copy overrides in build-public.py or JS. Run scripts/build-release.py --key-file PATH to sync calendar/work/deck, verify or render the Mac v15 pipeline, stamp and encrypt. Never commit private-work, a key, a staffing scenario, or the deck build sources. The encrypted payload includes program.json; unlock-work.py restores it. Legacy migration requires the approved registry and checks every baseline ID.

Eight moved events use monthly windows with no exact dates. They appear under Срок уточняется in their month and in search, never repeated across daily cells. Relative preparation uses planning windows and before/after relationships. programType differs from ownership/frequency; HURMA is joint, not sole lead. Resource groups deduplicate shared production; child rows accept only additional work. Preserve all stored user rows and flag changed schedules for review.

/presentation/ packages the approved77-page v15 PDF with measured SHA, original4K previews and a revision manifest. Preserve the PDF and visual composition; bump presentation.version before replacing a packaged PDF. A changed registry rebuilds through the local macOS renderer. Rerendered slides require visual review, not only text-bound checks. Viewer updates preserve slide key and wait for coherent HTML/manifest/assets. /names/ remains independent; do not overwrite it in a calendar release.

## MASTER replacement, 5 November 2026 — current authority

The latest explicit user decision replaces the entire calendar with `Wine27_2027_Master_Program.md`; it overrides historical programme decisions above. Current canonical schema is `wine27-master-2027/v1`: 1,283 dated instances and 59 yearly entries. Never modify MASTER dates/times/venues to accommodate experts. The user explicitly retained the expert programme as a secondary overlay: 15 additional preliminary programmes plus `award` bound to the MASTER event without duplication. Move only experts if an actual conflict is established; simultaneous dates alone are not proof of a conflict.

Both editions remain: root is the clean exhibition edition for the director, `/work/` is the encrypted working edition under the existing owner key. Internal editorial history, source IDs in prose, preparation, booking workflow and technical comments belong only in work. Preserve their full canonical text there; `scripts/director-copy.json` is the checked public copy projection. Keep factual preliminary status, genuine booking limitations and event conditions.

Use `scripts/import-master.py` and `scripts/build-release.py`; see `docs/master-import.md`. Public runtime is `master-app.js`/`master.css`, with immutable hashed assets in `calendar/`. Legacy recurrence engines are no longer loaded. Every MASTER occurrence appears once on its source date; range endpoints remain in its details. Monthly rows show start time/title/venue, cards show complete end time (including “до заката”), every block and every cinema phase. All 365 days and all 59 year events must remain represented. The separate 4 November presentation and `/names/` are preserved.

Never overwrite the existing resource scenario storage. Prior rows stay exportable and are not automatically mapped onto the new calendar; newly entered rows use canonical IDs. Keep the team calculator collapsed. Preserve canonical source, public-copy projection and expert supplement inside the encrypted payload; never publish plaintext private-work or the owner key. Release root/work HTML, versions, generated assets and payload together, preserving unrelated remote changes.

Latest direct navigation correction, 5 November 2026: remove every presentation link from the main calendar. Preserve the separate presentation files; the user will revise them later as an independent section, like /names/. Do not rebuild or promote that deck as part of this calendar replacement.

Names-page spelling (5 November 2026): write «Парадиз» in Russian in every visible heading and description, as directly requested by the user.

Director edition follow-up, 5 November 2026: restore the established colour coding in both year and month cards: festivals yellow, major events wine, regular programme mint, experts dark green. Keep the rejected legend absent. Show complete multi-day periods immediately on cards. Exhibition runs are 5 February–31 March and 12 November–19 December, derived from MASTER special_conditions; distinguish opening date and exhibition period without moving or multiplying canonical event instances.

Names-page mobile priority (5 November 2026): phones are the primary experience. Keep the continuous list and 3 fields per place, readable 16px entry/select text, 48px or larger controls, compact uncropped photos, a native place-jump menu and direct CSV download. Hide fixed actions while typing on phones, keep focused fields visible as the viewport changes, and use Enter for the next variant or Done within each place, never implicit submission. Preserve drafts, source wording, no game mechanics and the full desktop layout. Verify phone widths and keyboard/draft/download behavior before marking a release checked.

Latest direct wording correction: on every day from 1 through 10 January, display «Новогодняя программа». On those days do not show «Отдельных событий нет» in the unfiltered calendar. Retain the detailed MASTER occurrences within that period; the daily context label is not an additional dated event or an invented time.
