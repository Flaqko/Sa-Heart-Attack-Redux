# Heart Attack Redux v1.1

Original concept: **Junior_Djjr – Heart Attack Mod v1.0 (2020)**  
Custom CLEO Redux remaster: **Flaqko**

Target: **GTA San Andreas Classic 1.0 + CLEO Redux**

## What changed in v1.1

This version rebalances the heart-attack timing so it can realistically happen during missions like **Running Dog** if CJ is very fat and keeps pushing himself.

The immersive sequence is unchanged:
1. CJ becomes tired/out of breath.
2. CJ clutches his torso and collapses.
3. CJ dies and normal WASTED behavior takes over.

## Features

- Fat alone does **not** cause heart attacks.
- Danger begins above **600 FAT**.
- CJ must be actively **sprinting on foot** for strain to build.
- Sprint strain carries across normal short stamina breaks.
- Longer rests gradually recover accumulated strain.
- No custom animations, filesystem access, or memory permission are required.

## v1.1 balance

This version is much harsher so obesity has real gameplay consequences.

Approximate randomized accumulated-sprint ranges:

- **1000 FAT:** 20–40 seconds
- **900 FAT:** 25–45 seconds
- **800 FAT:** 30–50 seconds
- **700 FAT:** 35–55 seconds
- **600 FAT:** 40–60 seconds

These are **accumulated sprint times**, not one uninterrupted sprint.

## Recovery system

Accumulated strain is not permanent.

- For the first **10 seconds after CJ stops sprinting**, strain is preserved.
- After 10 seconds of rest, strain recovers at about **1 second of strain for every 4 seconds of rest**.
- Dropping to **600 FAT or lower** clears the accumulated strain immediately.

So if CJ pauses briefly and keeps chasing, the danger remains. If he rests long enough, he recovers.

## Installation

Place `HeartAttackRedux_v1.1.js` in your CLEO folder.

No `[fs]` or `[mem]` permission tags are required.

## Credits

- Original Heart Attack Mod concept: **Junior_Djjr**
- CLEO Redux remaster and custom design: **Flaqko**
