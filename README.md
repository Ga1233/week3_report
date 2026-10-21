# TrailNest: Integrating JavaScript for Interactive User Experience (Week 3)

The Week 2 TrailNest hiking page, enhanced with **plain JavaScript** (no libraries or frameworks) for the Yuva Intern Week 3 task. The page still works as a normal static page without JavaScript; the script only adds behaviour on top.

## Project Structure

```
project-week3/
├── index.html      # Markup, with hooks for each interactive feature (ids, data-* attributes, ARIA)
├── styles.css      # Responsive layout from Week 2 + styles for dark mode, chips, FAQ, validation states
├── script.js       # All interactivity, split into 10 commented sections
├── images/         # SVG illustrations
├── screenshots/    # Dark mode, filtering, validation and mobile menu
└── README.md       # Technical documentation (this file)
```

## How to Run

Open `index.html` in any modern browser. No build step or server is needed.

## Interactive Features

| # | Feature | What it does | Techniques |
|---|---------|--------------|------------|
| 1 | Dark / light theme | Button in the header switches the theme, remembers the choice and respects the system preference on first visit | `data-theme` attribute, CSS variables, `localStorage`, `matchMedia` |
| 2 | Mobile menu | Hamburger button opens and closes the menu, animates into an X, closes on link click, `Esc` or when resized to desktop | `aria-expanded`, `classList.toggle`, keyboard events, `matchMedia` change listener |
| 3 | Trail filter and live search | Difficulty chips and a search box work together and update the "Showing X of Y trails" counter; an empty-state message appears when nothing matches | `data-*` attributes, `input` and `click` events, `hidden` property, `aria-live` |
| 4 | FAQ accordion | One answer open at a time, with a rotating plus icon | `aria-expanded`, `aria-controls`, `hidden` |
| 5 | Form validation | Validates name and email on blur and on submit, shows inline errors, moves focus to the first error, shows a success message, and has a live character counter | Regular expressions, `preventDefault`, `aria-invalid`, `form.reset()` |
| 6 | Animated counters | Statistics count up when scrolled into view | `IntersectionObserver`, `requestAnimationFrame`, easing function |
| 7 | Scroll reveal | Cards and text fade in as they enter the viewport | `IntersectionObserver`, CSS transitions |
| 8 | Back-to-top button | Appears after scrolling 500px and scrolls smoothly to the top | `scroll` event throttled with `requestAnimationFrame` |
| 9 | Rotating hero word | The end of the hero heading changes every 3 seconds with a fade | `setInterval`, `setTimeout` |

## Code Structure

`script.js` is wrapped in an IIFE with `'use strict'` so nothing leaks into the global scope. Each feature lives in its own `init...()` function, called once from `DOMContentLoaded`, so features are independent and easy to read, test or remove. Small helpers (`$`, `$$` and a safe `store` wrapper for `localStorage`) avoid repetition.

JavaScript, HTML and CSS are kept separate:

- **HTML** declares the interactive elements (buttons, inputs, `data-filter`, `data-difficulty`, `data-count`) and the accessibility attributes.
- **CSS** defines every visual state (`.is-active`, `.open`, `.visible`, `[aria-invalid="true"]`, `[data-theme="dark"]`). JavaScript only adds or removes classes and attributes, never inline layout styles.
- **JavaScript** listens for events and updates the DOM.

## Accessibility and Progressive Enhancement

- The `js` class is added to `<html>` by the script, so the scroll-reveal hiding only applies when JavaScript is running.
- Buttons use real `<button>` elements with `aria-expanded`, `aria-pressed`, `aria-controls` and `aria-label` kept in sync.
- Errors and result counts use `aria-live` regions, and focus moves to the first invalid field.
- `prefers-reduced-motion` disables counters, the rotating word and reveal animations.

## Testing

I ran 36 automated checks in headless Chromium (Playwright), covering theme toggle and persistence after reload, every filter and search combination, the FAQ accordion, valid and invalid form input, counters, the back-to-top button and the mobile menu (open, `Esc`, link click). All passed, with no console errors and no horizontal scrolling at 375px or 1280px.

## Screenshots

| Dark mode | Filter: Hard | Form validation |
|:---:|:---:|:---:|
| ![Dark mode](screenshots/dark-mode.png) | ![Filter](screenshots/filter-hard.png) | ![Validation](screenshots/form-errors.png) |

## Challenges and Solutions

| Challenge | Solution |
|-----------|----------|
| Filter and search had to work together | Store the active filter in one variable and recompute visibility from both conditions in a single `update()` function |
| Hidden cards stayed invisible after scroll-reveal | `update()` marks revealed cards as `visible`, so filtered-in cards never stay at opacity 0 |
| Validation messages felt annoying while typing | Validate on `blur` first; only re-validate on `input` once a field is already marked invalid |
| Animated counters ran before users could see them | Start them with `IntersectionObserver` and stop observing after the first run |
| `localStorage` can throw in private mode | Wrapped access in a small `try/catch` helper |
| Scroll handler could hurt performance | Throttled with `requestAnimationFrame` and a passive listener |
| Menu state getting stuck after resizing | Added a `matchMedia` listener that closes the menu at desktop width |

## Technologies

HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JavaScript (ES6+: DOM API, `IntersectionObserver`, `localStorage`, `matchMedia`)

## Author

**Gaurav Prakash Gawade**, Yuva Intern, Week 3 Task
