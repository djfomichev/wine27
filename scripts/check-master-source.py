#!/usr/bin/env python3
"""Independent MASTER and expert audit. Read-only unless --report is supplied."""
from pathlib import Path
from datetime import date, datetime, timedelta
from collections import Counter, defaultdict
import calendar
import hashlib
import json
import re
import argparse
import sys

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--input', type=Path, default=ROOT/'private-work/program.json')
parser.add_argument('--master', type=Path, help='Optional original Markdown: compare its full canonical JSON.')
parser.add_argument('--supplement', type=Path, default=ROOT/'private-work/expert-supplement.json')
parser.add_argument('--report', type=Path, help='Optional detailed JSON report.')
args = parser.parse_args()
SOURCE = args.master
HERE = args.input.parent
data = json.loads(args.input.read_text())
events = data['events']
years = data['year_events']
by_id = {e['id']: e for e in events}
by_year = {e['id']: e for e in years}
venues = {v['id']: v for v in data['venues']}
checks = []
errors = []

def stable(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()

def check(name, value, details=None):
    checks.append({'check': name, 'passed': bool(value)})
    if not value:
        errors.append({'check': name, 'details': details})

def minutes(value):
    return int(value[:2]) * 60 + int(value[3:])

def dates_between(start, end):
    first, last = date.fromisoformat(start), date.fromisoformat(end)
    return [(first + timedelta(days=i)).isoformat() for i in range((last-first).days + 1)]

if SOURCE:
    raw = SOURCE.read_text(encoding='utf-8-sig')
    begin, end = '<!-- WINE27_CANONICAL_JSON_BEGIN -->', '<!-- WINE27_CANONICAL_JSON_END -->'
    check('one_pair_of_canonical_markers', raw.count(begin) == raw.count(end) == 1)
    block = raw[raw.index(begin)+len(begin):raw.index(end)]
    match = re.fullmatch(r'\s*```json\s*\n([\s\S]*?)\n```\s*', block)
    check('one_json_fence', bool(match))
    check('extracted_input_equals_full_MASTER_JSON', json.loads(match[1]) == data)
check('schema_year_timezone', data['schema_version'] == 'wine27-master-2027/v1' and data['year'] == 2027 and data['timezone'] == 'Europe/Moscow')
check('declared_event_count', len(events) == data['validation']['event_count'])
check('declared_year_event_count', len(years) == data['validation']['year_event_count'])
events_sha = hashlib.sha256(stable(events)).hexdigest()
check('declared_events_sha256', events_sha == data['validation']['events_sha256'])
pass2_hash = data['validation'].get('pass2', {}).get('events_sha256')
check('pass2_events_sha256', pass2_hash == events_sha)
for label, records in [('events', events), ('year_events', years), ('venues', data['venues']), ('conditional_programs', data['conditional_programs'])]:
    ids = [x['id'] for x in records]
    check(label+'_unique_nonempty_ids', len(ids) == len(set(ids)) and all(isinstance(x, str) and x for x in ids))

actual_months = {}
for month in range(1, 13):
    rows = [e for e in events if int(e['date'][5:7]) == month]
    actual_months[str(month)] = {'total': len(rows), 'kinds': dict(Counter(e['kind'] for e in rows))}
check('all_declared_month_counts_and_kind_counts', actual_months == data['validation']['month_counts'])
check('all_12_month_metadata', sorted(m['month'] for m in data['month_metadata']) == list(range(1, 13)))
check('all_365_explicit_month_days', sum(len(m['days']) for m in data['month_metadata']) == 365 and all(m['days'] == dates_between(f'2027-{m["month"]:02}-01',f'2027-{m["month"]:02}-{calendar.monthrange(2027, m["month"])[1]}') for m in data['month_metadata']))
themes = {m['month']: m['theme'] for m in data['month_metadata']}
check('event_month_themes', all(e['month_theme'] == themes[int(e['date'][5:7])] for e in events))

references, timing, blocks, phases, duplicates, performance_metadata = [], [], [], [], [], []
signature = defaultdict(list)
for e in events:
    eid, day = e['id'], date.fromisoformat(e['date'])
    if day.year != 2027 or e.get('timezone') != 'Europe/Moscow': timing.append([eid, 'date/timezone'])
    if e['venue_id'] not in venues: references.append([eid, 'venue_id', e['venue_id']])
    for yid in e['year_event_ids']:
        if yid not in by_year: references.append([eid, 'year_event_ids', yid])
        elif eid not in by_year[yid]['event_ids']: references.append([eid, 'missing_inverse_year_link', yid])
    if e.get('parent_id') and e['parent_id'] not in by_year and e['parent_id'] not in by_id:
        references.append([eid, 'parent_id', e['parent_id']])
    for field in ['embedded_in_event_id', 'trigger_event_id']:
        if e.get(field):
            other = by_id.get(e[field])
            if not other: references.append([eid, field, e[field]])
            elif other['date'] != e['date']: references.append([eid, field+'_wrong_date', e[field]])
            elif field == 'trigger_event_id' and other['kind'] != 'bell': references.append([eid, 'trigger_not_bell'])
    anchor = e['time_anchor']
    if anchor not in ['fixed', 'sunset', 'after_bell', 'separate_program']: timing.append([eid, 'unknown_anchor', anchor])
    for field in ['start_time', 'end_time']:
        if e.get(field) and not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d', e[field]): timing.append([eid, field, e[field]])
    start, finish = e.get('starts_at'), e.get('ends_at')
    if anchor in ['sunset', 'after_bell']:
        if e.get('start_time') is not None or start is not None or e.get('sort_reference_is_public_time') is not False:
            timing.append([eid, 'solar_anchor_misrepresented_as_fixed'])
        if e['display_time'] != ('На закате' if anchor == 'sunset' else 'Сразу после колокола'):
            timing.append([eid, 'solar_display_time'])
    if start:
        a = datetime.fromisoformat(start)
        if a.utcoffset() != timedelta(hours=3) or a.date() != day or a.strftime('%H:%M') != e['start_time']:
            timing.append([eid, 'starts_at_inconsistent'])
    elif e.get('start_time'): timing.append([eid, 'missing_starts_at'])
    if finish:
        b = datetime.fromisoformat(finish)
        expected_day = day + timedelta(days=int(e.get('ends_next_day', False)))
        if b.utcoffset() != timedelta(hours=3) or b.date() != expected_day or b.strftime('%H:%M') != e['end_time']:
            timing.append([eid, 'ends_at_inconsistent'])
        if start and not b > a: timing.append([eid, 'nonpositive_duration'])
    elif e.get('end_time'): timing.append([eid, 'missing_ends_at'])
    tb = e.get('time_blocks', [])
    if e['kind'] in ['jazz', 'etudes_duo', 'kerman_live']:
        if len(tb) != 5 or [t.get('type') for t in tb] != ['performance','break','performance','break','performance']:
            blocks.append([eid, 'expected_3_sets_2_breaks'])
        else:
            durations = [minutes(t['end_time'])-minutes(t['start_time']) for t in tb]
            if durations != [30,15,30,15,30]: blocks.append([eid, 'durations', durations])
            if any(tb[i]['end_time'] != tb[i+1]['start_time'] for i in range(4)): blocks.append([eid, 'discontinuous'])
            expected_start = e.get('start_time')
            expected_end = e.get('end_time')
            if tb[0]['start_time'] != expected_start or tb[-1]['end_time'] != expected_end:
                blocks.append([eid, 'event_envelope_mismatch'])
            if e.get('performance_start_time') and (e['performance_start_time'] != tb[0]['start_time'] or e.get('performance_end_time') != tb[-1]['end_time']):
                performance_metadata.append({'event_id':eid,'time_blocks':[tb[0]['start_time'],tb[-1]['end_time']],'performance_fields':[e['performance_start_time'],e.get('performance_end_time')]})
    ph = e.get('phases', [])
    if e['kind'] == 'cinema':
        if len(ph) != 3 or not e.get('film'): phases.append([eid, 'missing_route_or_film'])
        else:
            if [x.get('venue_id') for x in ph] != ['cinema', None, 'coworking']: phases.append([eid, 'route'])
            if ph[0]['start_time'] != e['start_time'] or ph[-1]['end_time'] != e['end_time']: phases.append([eid, 'event_envelope_mismatch'])
            if any(ph[i]['end_time'] != ph[i+1]['start_time'] for i in range(2)): phases.append([eid, 'discontinuous'])
            if any(minutes(x['end_time']) <= minutes(x['start_time']) for x in ph): phases.append([eid, 'nonpositive_duration'])
    for ph in e.get('phases', []):
        if ph.get('venue_id') and ph['venue_id'] not in venues: references.append([eid, 'phase_venue', ph['venue_id']])
    signature[(e['date'], e['title'], e['venue_id'], e.get('start_time'))].append(eid)
for sig, ids in signature.items():
    if len(ids) > 1: duplicates.append({'signature': sig, 'ids': ids})

for y in years:
    if y['start_date'] > y['end_date']: timing.append([y['id'], 'inverted_year_range'])
    for vid in y['venue_ids']:
        if vid not in venues: references.append([y['id'], 'year_venue', vid])
    for eid in y['event_ids']:
        e = by_id.get(eid)
        if not e: references.append([y['id'], 'event_ids', eid])
        elif y['id'] not in e['year_event_ids']: references.append([y['id'], 'missing_inverse_event_link', eid])
        elif not y['start_date'] <= e['date'] <= y['end_date']: references.append([y['id'], 'linked_event_outside_year_range', eid])

check('all_references_resolve_and_year_links_are_reciprocal', not references, references)
check('all_temporal_fields_consistent', not timing, timing)
check('all_69_three_set_programmes_preserve_five_blocks', not blocks, blocks)
known_performance = {'event_id':'w27-checked-0222-0053','time_blocks':['19:00','21:00'],'performance_fields':['19:30','21:30']}
known_warnings = [x for x in performance_metadata if x == known_performance]
check('no_unexplained_auxiliary_performance_mismatch', all(x == known_performance for x in performance_metadata), performance_metadata)
check('all_12_cinema_routes_and_envelopes', not phases, phases)
check('no_same_date_title_venue_start_duplicates', not duplicates, duplicates)
check('unique_sort_indexes', len({e['sort_index'] for e in events}) == len(events))
check('source_order_is_date_then_sort_index', events == sorted(events, key=lambda e:(e['date'], e['sort_index'])))
check('all_booking_unconfirmed', all(e['booking_status'] == 'not_confirmed' for e in events))
check('only_live_calendar_statuses', set(e['calendar_status'] for e in events) == {'planned','for_consideration'})
barin = by_year['barin']
check('barin_all_instances_for_consideration', barin['status'] == 'for_consideration' and all(by_id[eid]['calendar_status'] == 'for_consideration' for eid in barin['event_ids']))
check('conditional_programmes_do_not_create_fixed_instances', all(x['public_calendar'] is False and x['fixed_occurrences'] == [] for x in data['conditional_programs']))

def kind(kind): return [e for e in events if e['kind'] == kind]
bell_dates = [e['date'] for e in kind('bell')]
check('bell_exactly_each_day_April_through_October', bell_dates == dates_between('2027-04-01','2027-10-31'))
promoter_dates = [e['date'] for e in kind('central_promogroup')]
expected_promoters = [d for d in dates_between('2027-06-01','2027-08-31') if date.fromisoformat(d).isoweekday() == 6]
check('summer_promoters_each_Saturday_last_Aug28', promoter_dates == expected_promoters and promoter_dates[-1] == '2027-08-28')
dance_dates = [e['date'] for e in kind('city_dance')]
expected_dances = [d for d in dates_between('2027-06-01','2027-09-30') if date.fromisoformat(d).isoweekday() in [4,5,6,7]]
check('city_dance_all_69_Thu_to_Sun_and_triggered_by_bell', dance_dates == expected_dances and all(e.get('trigger_event_id') in by_id for e in kind('city_dance')))
check('no_beach_or_rooftop_DJ_occurrences_from_October', not [e for e in events if e['kind'] in ['beach','rooftop'] and e['date'] >= '2027-10-01'])
check('no_regular_winter_own_orchestra_or_funk', not [e for e in events if e['kind'] in ['orchestra','rotunda_orchestra','central_bar'] and e['date'] >= '2027-11-01'])
check('all_rooftop_events_use_sunset', all(e['time_anchor'] == 'sunset' for e in kind('rooftop')))
check('no_Etudes_music_June_through_September', not [e for e in events if e['kind'] in ['etudes_duo','etudes_vinyl'] and '2027-06-01' <= e['date'] <= '2027-09-30'])
kerman_july = [e['date'] for e in kind('kerman_live') if e['date'].startswith('2027-07')]
check('Kerman_July_3_and_24', kerman_july == ['2027-07-03','2027-07-24'])
check('no_Kerman_or_dance_floor_during_orchestra_festival', not [e for e in events if e['kind'] in ['kerman_live','dance'] and '2027-07-05' <= e['date'] <= '2027-07-11'])
check('Kerman_outdoors_June_through_October', all(e['venue_id'] == 'kerman-courtyard' for e in kind('kerman_live') if '2027-06-01' <= e['date'] <= '2027-10-31'))
check('Kerman_October_16h_NovDec_1930_indoor', all(e['start_time'] == '16:00' for e in kind('kerman_live') if e['date'].startswith('2027-10')) and all(e['start_time'] == '19:30' and e['venue_id'] == 'kerman-kebab' for e in kind('kerman_live') if e['date'] >= '2027-11-01'))
check('NewYear_range_preserved_without_2028_instances', by_year['newyear-dec']['start_date'] == '2027-12-25' and by_year['newyear-dec']['end_date'] == '2028-01-08' and all(e['date'][:4] == '2027' for e in events))
for month in range(1,13):
    for k, expected in [('cinema',1),('coffee',1),('book',1 if month == 1 else 2),('podcast',1 if month % 2 else 0)]:
        check(f'{k}_frequency_month_{month}', sum(int(e['date'][5:7]) == month for e in kind(k)) == expected)
run_week_counts = Counter(date.fromisoformat(e['date']).isocalendar()[:2] for e in kind('running'))
check('running_once_per_programme_week_on_weekend', all(v == 1 for v in run_week_counts.values()) and all(date.fromisoformat(e['date']).isoweekday() in [6,7] for e in kind('running')))
coffee_weeks = {date.fromisoformat(e['date']).isocalendar()[:2] for e in kind('coffee')}
check('running_on_Sunday_in_coffee_weeks', all(date.fromisoformat(e['date']).isoweekday() == 7 for e in kind('running') if date.fromisoformat(e['date']).isocalendar()[:2] in coffee_weeks))

# Venue checks use exact local instants only. Solar references are not booking times.
venue_slots = defaultdict(list)
for e in events:
    if e.get('phases'):
        for phase in e['phases']:
            if phase.get('venue_id'):
                a = datetime.fromisoformat(e['date']+'T'+phase['start_time']+':00+03:00')
                b = datetime.fromisoformat(e['date']+'T'+phase['end_time']+':00+03:00')
                venue_slots[phase['venue_id']].append((a,b,e['id']))
    elif e.get('starts_at') and e.get('ends_at'):
        venue_slots[e['venue_id']].append((datetime.fromisoformat(e['starts_at']),datetime.fromisoformat(e['ends_at']),e['id']))
overlaps = []
for venue, slots in venue_slots.items():
    slots.sort()
    for i, a in enumerate(slots):
        for b in slots[i+1:]:
            if b[0] >= a[1]: break
            if a[2] != b[2]: overlaps.append({'venue_id':venue,'events':[a[2],b[2]]})
check('no_exact_venue_time_overlap_including_cinema_phases', not overlaps, overlaps)

# Mandatory conditions are not all duplicated in individual descriptions.
special = data['special_conditions']
check('special_conditions_all_five_sections', all(k in special for k in ['love_frame','march8','may','expo','event_hall_turnaround']))
concert = re.sub(r'\s+', '', special['love_frame']['concert']).lower()
piers = re.sub(r'\s+', '', special['love_frame']['piers']).lower()
check('Feb13_guest_vocal_ticketing_tables_preserved', all(x in concert for x in ['синематика','вокалист','билетная','столикинадвоих']))
check('Feb14_two_domes_two_piers_two_tables_preserved', all(x in piers for x in ['2прозрачныхкупольныхшатра','2пирсах','всего2стола','амбассадор']))
check('March8_artist_options_not_booked', special['march8']['booking_status'] == 'not_confirmed' and special['march8']['artist_options'] == ['Леонид Агутин','Владимир Пресняков'])

supplement = json.loads(args.supplement.read_text())
supplement_hash = hashlib.sha256(stable(supplement)).hexdigest()
expert_checks = {}
for label in ['public','working']:
    edition = supplement[label]
    projects = edition['portfolio']['projects']
    records = edition['events']
    expert_checks[label] = {x['id']:x for x in records}
    pids, eids = [x['id'] for x in projects], [x['id'] for x in records]
    check(label+'_expert_supplement_16_unique_projects', len(pids) == len(set(pids)) == 16 and len(eids) == len(set(eids)) == 16 and set(eids) == set(pids))
    check(label+'_expert_15_roots_and_one_child', sum(not x.get('parent_id') for x in projects) == 15 and sum(bool(x.get('parent_id')) for x in projects) == 1)
    sparkling = next(x for x in projects if x['id']=='exp_sparkling_session')
    check(label+'_sparkling_first_year_still_unknown', sparkling.get('first_year') is None and sparkling.get('parent_id') == 'wine_competition' and sparkling.get('date_status') == 'year_unconfirmed')
    check(label+'_expert_booking_not_confirmed', all(x.get('bookingStatus') in [None,'unconfirmed'] for x in records))
    check(label+'_expert_dates_still_proposals', all(x.get('schedule',{}).get('status') == 'proposed' for x in records))
    for x in records:
        if x.get('start') and x.get('end'):check(label+'_expert_range_'+x['id'], x['start'] <= x['end'])
check('expert_editions_preserve_same_ids_and_dates', sorted((x['id'],x.get('start'),x.get('end')) for x in supplement['public']['events']) == sorted((x['id'],x.get('start'),x.get('end')) for x in supplement['working']['events']))
binding = supplement['masterBindings'].get('award',{})
check('award_reuses_MASTER_identity', binding.get('year_event_id') == 'award' and 'award' in by_year)
check('award_dates_match_MASTER', all(x['award'].get('start') == by_year['award']['start_date'] and x['award'].get('end') == by_year['award']['end_date'] for x in expert_checks.values()))
# Coincident calendar dates alone do not establish a conflict. Require a resolved
# identical venue and exact local intervals before reporting an actual collision.
expert_conflicts = []
experts_without_exact_venue_and_hours = []
venue_by_name = {v['name']:v['id'] for v in data['venues']}
for e in supplement['working']['events']:
    if e['id'] == 'award':continue
    vid = e.get('venue_id') or venue_by_name.get(e.get('place',''))
    start, finish = e.get('starts_at'), e.get('ends_at')
    if not (vid and start and finish):
        experts_without_exact_venue_and_hours.append(e['id']);continue
    a,b = datetime.fromisoformat(start),datetime.fromisoformat(finish)
    for c,d,mid in venue_slots.get(vid,[]):
        if a < d and c < b:expert_conflicts.append({'expert_id':e['id'],'master_id':mid,'venue_id':vid})
check('no_proven_expert_collision_with_MASTER', not expert_conflicts, expert_conflicts)

by_day = Counter(e['date'] for e in events)
all_days = dates_between('2027-01-01','2027-12-31')
report = {
    'review_scope': 'Independent source-only integrity, timing, links, phases, sets, statuses and seasonal rules. No site changes or browser use.',
    'source': str(SOURCE) if SOURCE else 'Canonical MASTER JSON', 'input': str(args.input),
    'counts': {'events':len(events),'year_events':len(years),'venues':len(venues),'conditional_programs':len(data['conditional_programs']),'cinema_with_phases':len(kind('cinema')),'events_with_time_blocks':sum(bool(e.get('time_blocks')) for e in events),'cross_midnight_events':sum(e['ends_next_day'] for e in events),'solar_start_events':sum(e['time_anchor'] in ['sunset','after_bell'] for e in events),'separate_program_events':len([e for e in events if e['time_anchor']=='separate_program']),'blank_calendar_days':sum(d not in by_day for d in all_days),'peak_daily_event_count':max(by_day.values())},
    'hashes': {'events_sha256':events_sha,'normalized_input_sha256':hashlib.sha256(stable(data)).hexdigest()},
    'checks':checks, 'source_findings':errors, 'warnings':known_warnings,
    'expert_supplement':{'observed_sha256':supplement_hash,'projects':16,'MASTER_award_binding':binding,'proven_conflicts':expert_conflicts,'unknown_venue_or_hours':experts_without_exact_venue_and_hours},
    'source_finding_resolution': {
        'w27-checked-0222-0053': {
            'severity':'source_metadata_inconsistency',
            'display_contract':'Use the mutually consistent start_time/end_time, starts_at/ends_at, display_time and time_blocks: 19:00–21:00.',
            'conflicting_original_fields':{'performance_start_time':'19:30','performance_end_time':'21:30'},
            'canonical_action':'Preserve the original fields unchanged; record the discrepancy instead of changing accepted event dates or the input hash.'
        }
    },
    'render_requirements': [
        'Year view renders the 59 year_events in chronological order; month view renders the 1283 event instances without recurrence expansion or additional year-range cards.',
        'Keep all 365 days including blank dates. A date_range_end is metadata, not permission to create extra instances.',
        'Solar sort references are not public start times. Use display_time; preserve start/end anchors, all-night end dates and start-date-only cards.',
        'Preserve and display all 5 time_blocks for each 3-set performance, all 3 phases and film metadata for each single cinema card.',
        'Venue display uses event.venue; venue_id joins the dictionary without overwriting meeting-point and terrace labels.',
        'Show consideration and unconfirmed booking semantics. Artist options in special_conditions are options, not confirmed participation.',
        '13 February ticketing and tables-for-two exist only in special_conditions.love_frame.concert; render them in its event card. 14 February retains exactly 2 domes and 2 tables.',
        'Do not expose event_hall_turnaround, production_notes, conditional_programs, validation or editorial_change_log in public cards.',
        'Special-conditions source text has merged number/word spacing; apply display-only typography without changing raw canonical values.'
    ]
}
if args.report:
    args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'FAIL' if errors else 'PASS','checks':len(checks),'failed':len(errors),'counts':report['counts'],'warnings':known_warnings,'source_findings':errors,'expert_proven_conflicts':expert_conflicts,'expert_unknown_venue_or_hours':len(experts_without_exact_venue_and_hours)},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
