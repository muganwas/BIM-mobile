# BIM-mobile
 BIM wifi business mobile app

## UI design language

Tabs and record lists are shared primitives. Use them instead of ad-hoc tables so
rows never scroll horizontally on a phone.

- **Tabs**: `components/SegmentedTabs.tsx` — pill tabs that scroll horizontally
  on their own, with an optional count per tab (`count`).
- **Lists**: `components/RecordList.tsx`
  - `RecordList` renders the list shell with loading/empty states and an optional
    header action (`title`, `description`, `headerAction`, `loading`, `isEmpty`).
  - `RecordCard` renders one record: `title`, `subtitle`, `badge` (status pill),
    `fields` (two-column grid that wraps; set `fullWidth` for long values) and
    `actions` (buttons wrap under the fields, so a row with an action button never
    needs a horizontal scroll). Action `tone` keeps the app's colour coding:
    `success` (lime) for view, `warning` (yellow) for edit, `danger` (red) for
    delete/block, `primary`/`info`/`neutral` for everything else.
- Each item is already a `TileContainer` card, so do not wrap `RecordCard` in
  another `TileContainer`.
- Screens that render a list must scroll: use `ParallaxScrollView` and pass
  `onRefresh`/`refreshing` for pull-to-refresh.
- All copy goes through `constants/Trans.ts` (`translateWithVariables` for
  strings with placeholders); never inline strings in a screen.
