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
  - `RecordCard` renders one record: optional `title`/`subtitle`, `badge` (status
    pill), `fields` (compact two-column grid of inline label/value pairs that
    wraps; set `fullWidth` for long values) and `actions` (buttons wrap under the
    fields, so a row with an action button never needs a horizontal scroll).
    Cards that are pure data — e.g. transactions — omit `title`/`subtitle` and
    carry every value (including the site/router name) as a `field`. Action `tone`
    keeps the app's colour coding:
    `success` (lime) for view, `warning` (yellow) for edit, `danger` (red) for
    delete/block, `primary`/`info`/`neutral` for everything else.
- Every list sits on one elevated container: wrap `RecordList` in a
  `TileContainer`, unless the list already lives inside one (e.g. the dashboard
  transactions and the router-details tab panels).
- `TileContainer` is flat: white background plus a 1px border, no shadow. Tiles
  span the content area, whose `paddingHorizontal` is 10 — never add an extra
  `marginHorizontal` to a tile or its wrapper.
- Parent/container tiles (list wrappers, tab panels) pass `flat`; the child tiles
  they hold (record cards, package cards) stay raised with the default soft shadow.
- Lists on tabs share a single elevated container for the tab panel — do not give
  each list inside a tab its own tile (see `packages-tab-panel` and the
  router-details tile).
- A list's title and description belong inside the tile with the list (pass
  `title`/`description` to `RecordList` instead of rendering text above it) so the
  header and rows read as one group.
- Screens that render a list must scroll: use `ParallaxScrollView` and pass
  `onRefresh`/`refreshing` for pull-to-refresh.
- All copy goes through `constants/Trans.ts` (`translateWithVariables` for
  strings with placeholders); never inline strings in a screen.
