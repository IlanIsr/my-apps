# app-1 — Hebrew Date Converter

Converts dates between the Hebrew and Gregorian calendars, built on
[`@hebcal/core`](https://github.com/hebcal/hebcal-es6).

- **Hebrew → Gregorian**: pick a Hebrew day + month; get the next Gregorian date
  it falls on (`findNextHebrewDate`).
- **Gregorian → Hebrew**: pick a day/month/year; get the Hebrew date
  (`calculateHebrewDate`).

Calendar logic lives in `lib/hebcal.ts`. Dev server runs on port 3000
(`pnpm --filter app-1 dev`).
