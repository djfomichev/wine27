# Calendar MASTER 2027

The source is `private-work/program.json`, schema `wine27-master-2027/v1`, imported losslessly from the canonical block of Wine27_2027_Master_Program.md. The canonical events array has 1,283 entries; the year overview has all 59 `year_events`. Its declared events SHA256 is `2743dfd5c455344237ee98c0402c3395761a0400b3b01cb4dbe3acfbbb53c9c4`.

Direct user exception, 5 November 2026: retain the expert programme after MASTER. `private-work/expert-supplement.json` preserves its original source/statuses, portfolio and preparation. Fifteen additional programmes remain preliminary. The sixteenth, award, binds to the MASTER award without creating another ceremony. MASTER dates, times and venues have priority. No expert conflict is established because its times and venues are unconfirmed; no dates were moved.

## Model and display

- `events` → 1:1 canonical dated instances, stable IDs; no recurrence generator. A MASTER range is preserved in the card, not expanded into new daily occurrences.
- `year_events` → chronological yearly overview, complete titles and venues. Expert supplement is additional, not part of the source count/hash.
- `month_metadata.days` → all 365 dated sections. The monthly row shows start label, complete title and exact event venue (including meeting points/terraces).
- Detail cards retain date ranges, start/end or solar end anchors, guest descriptions, every performance/break in `time_blocks`, all cinema `phases`, and statuses.
- `venues` stays intact. Conditional programmes, production notes, reservations and source validation stay in the encrypted working edition.
- The public data projection intentionally omits production fields. The encrypted payload preserves all canonical fields and the separate expert supplement. It does not contain the owner access key.
- `special_conditions` remains intact in work; guest-specific 13/14 February conditions and unconfirmed March artists are projected to their cards.
- Existing resource scenario storage remains under `belyi-mys-2027-resource-scenario-v1`, untouched by automatic updates. Its prior values are exportable; they are not silently applied to the replaced programme.
- The 4 November presentation and `/names/` are separate preserved sections. The presentation is not linked from the main calendar and is not rebuilt or represented as the imported MASTER.

Public runtime: `master-app.js` + `master.css`. The build emits immutable content-hashed public bundles under `calendar/`; root HTML references one coherent generation. Legacy JS is no longer loaded by either calendar edition.

## Repeatable import and checks

```
python3 scripts/import-master.py --master PATH_TO_MASTER.md --key-file PRIVATE_KEY_PATH --backup-dir PRIVATE_BACKUP_DIRECTORY
```

This validates the input hash and IDs before replacement, backs up the previous local source, performs an atomic canonical-file replacement, and builds/checks the result. The same MASTER is idempotent. Preserve the expert supplement unless a later explicit decision changes it.

`build-release.py` validates both editions and their projections, 365 rendered dates and exactly one monthly occurrence per MASTER ID, solar/night timing, all phases/blocks, independent filters, source privacy, and AES-GCM round-trip recovery. `check-master-source.py --master PATH` independently checks all source fields, counts, schedules and links.

Known source inconsistency: `w27-checked-0222-0053` has consistent primary schedule and blocks 19:00–21:00 but auxiliary performance fields 19:30–21:30. The source is preserved unchanged; rendering uses primary schedule and blocks.

## Rollback

The pre-import release is `0ad1e09e6508bb24`, commit `268ad029ff88553045706bb936ada528f8921f15`. The owner's dated local backup includes the exact canonical source and its encrypted payload. Recover only calendar files from that checkpoint, preserving subsequent independent `/names/` and presentation changes, then atomically publish those assets with their matching HTML/version and encrypted payload. Source recovery and old payload decryption were tested successfully before deployment.

Follow-up display correction: the director calendar uses the established festival/major/regular/expert colours. Complete exhibition periods (5 February–31 March and 12 November–19 December) are derived from the MASTER special conditions and shown on the cards alongside their opening dates. Canonical occurrence dates and daily counts remain unchanged.
