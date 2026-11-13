# mfaresslimani.github.io

Personal site of Mohamed Fares Slimani: mobile engineer, AI researcher, university instructor.

- `index.html`, `home.css`, `home.js`: the home screen, styled as a phone OS ("Tsuki OS"). Widgets show who I am; each app icon opens a window (about, experience, research, toolbox, projects, an MRZ scanner with real ICAO 9303 check digits). Deep links such as `#experience` open the matching app. The wallpaper is a retinal vessel tree drawn on load.
- `work/`: all projects, with filters (uses `styles.css` and `script.js`).
- `work/zakat.html`, `work/french-touch.html`, `work/optica.html`: case studies with small live demos (`demos.js`).

Plain HTML, CSS and JavaScript. No build step.

```bash
python -m http.server 8080
```
