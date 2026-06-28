# RTL Live Browser Validation Report

**Date**: 2026-06-14  
**Tool**: Playwright (headless Chromium)  
**URL**: http://192.168.100.2:3000

---

## Results

| # | Check | Status | Detail |
|---|---|---|---|
| 1 | Login successful | PASS |  |
| 2 | Aside elements in DOM | PASS | count=1 |
| 3 | Document dir attribute | PASS | dir="rtl" |
| 4 | RTL Desktop sidebar visible | PASS | x=1664, y=64, w=256 |
| 5 | RTL: Sidebar on RIGHT (correct) | PASS | x=1664 |
| 6 | Collapse button clicked | PASS |  |
| 7 | RTL Desktop collapsed sidebar | INFO | x=1856, w=64 |
| 8 | Locale toggled to English | PASS |  |
| 9 | Document dir after toggle | PASS | dir="ltr" |
| 10 | LTR Desktop sidebar visible | PASS | x=0, y=64, w=256 |
| 11 | LTR: Sidebar on LEFT (correct) | PASS | x=0 |
| 12 | Collapse button clicked | PASS |  |
| 13 | LTR Desktop collapsed sidebar | INFO | x=0, w=64 |
| 14 | Console errors | FAIL | Failed to load resource: net::ERR_CONNECTION_REFUSED; Failed to load resource: net::ERR_CONNECTION_REFUSED; Failed to load resource: net::ERR_CONNECTION_REFUSED |

---

## Screenshots

| File | Mode | Viewport |
|---|---|---|
| rtl-live-01-en-desktop-expanded.png | English LTR | Desktop (1920×1080) |
| rtl-live-02-en-desktop-collapsed.png | English LTR | Desktop (1920×1080) |
| rtl-live-03-en-tablet.png | English LTR | Tablet (1024×768) |
| rtl-live-04-en-mobile.png | English LTR | Mobile (375×812) |
| rtl-live-05-ar-desktop-expanded.png | Arabic RTL | Desktop (1920×1080) |
| rtl-live-06-ar-desktop-collapsed.png | Arabic RTL | Desktop (1920×1080) |
| rtl-live-07-ar-tablet.png | Arabic RTL | Tablet (1024×768) |
| rtl-live-08-ar-mobile.png | Arabic RTL | Mobile (375×812) |

---

## Verdict

**❌ FAIL** — 1 failure(s), 11 pass(es), 2 info entries
