# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

Notes:
- This project uses Create React App (CRA). The dev server listens on the `PORT` environment variable, defaulting to `3000`. We do not set a custom port in scripts to avoid conflicts with preview systems.
- Any `REACT_APP_*` variables are optional; the app tolerates them being undefined. See `src/envSafe.js` which is imported in `src/index.js` to normalize empty values.

### `npm run dev`

Cross‑platform dev convenience that maps CLI flags to CRA env:
- Example: `npm run dev -- --port 3000 --host 0.0.0.0`
- Defaults to `PORT=3000` and `HOST=0.0.0.0` if not provided.
- Does not use or override `REACT_APP_PORT` to avoid conflicts.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Theme and Customization

### Monochrome (Black & White) Theme

The app uses a centralized monochrome theme based on CSS variables in `src/App.css`. Adjust these variables to tweak the palette:

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #f7f7f7;
  --color-text: #111111;
  --color-text-muted: #666666;
  --color-border: #e5e5e5;
  --color-accent: #000000;           /* primary accent */
  --color-accent-contrast: #ffffff;  /* text on accent */
  --shadow: 0 10px 30px rgba(0,0,0,0.08);
  --radius: 14px;
}

[data-theme="dark"] {
  --color-bg: #0f0f10;
  --color-surface: #151515;
  --color-text: #eeeeee;
  --color-text-muted: #b0b0b0;
  --color-border: rgba(255,255,255,0.08);
  --color-accent: #ffffff;           /* accent flips in dark mode */
  --color-accent-contrast: #000000;
}
```

- Buttons, links, focus states, sidebar, header, and modals all reference these variables.  
- No colored accents (blue/amber/red) are used; all UI is grayscale.

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.ocean-btn`, variants: `.primary`, `.secondary`, `.danger`, `.ghost`)
- Layout (`.ocean-header`, `.ocean-main`, `.ocean-sidebar`, `.ocean-content`)
- Modal (`.ocean-modal`, `.ocean-modal-backdrop`)
- Inputs (`.field-input`, `.field-textarea`, `.search-input`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting
Moved: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size
Moved: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App
Moved: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration
Moved: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment
Moved: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify
Moved: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
