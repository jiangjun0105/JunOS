# City desktop

The JunOS desktop is a 3D wireframe of San Francisco, built with Three.js, AWS terrain tiles and an OpenStreetMap snapshot.
Each app floats as a reticle over a landmark. Clicking one flies the camera there and opens the app's window.

- `src/os/CityDesktop.tsx` is the React shell. It has one window (hidden → peek on hover → open on click) plus the HUD.
  It loads `scene.js` with a dynamic import, so three.js only runs in the browser.
- `scene.js` exports `createCity(root, on)` and returns `{ focus, release, home, setShift, dispose }`. It has no React and no window UI.
  The other modules each build one layer. `camera.js` runs camera flights as orbit legs (yaw / pitch / dist around a target).
- Edit landmarks (app id, place, coordinates, label) in `landmarks.js`. It is pure data and safe to import on the server.
  Edit colours, islands, the camera and the motion timings (`MOTION`) in `config.js`.
  To add an app, add its component and registry entry (`src/os/apps.tsx`) and a landmark.
- Run it with `pnpm dev`. `#cam=x,y,z,tx,ty,tz` opens a fixed camera view.
- Check the motion after touching it: `node scripts/city/trace.mjs [url] [app ids...]`.
  It drives headless Chrome in real time, opens and closes each app, and checks the leg durations, the straight dolly, the vertical leader line, the final framing and the return view.
- Rebuild the building snapshot (`public/city/sf-osm.json`) with `scripts/city/build-sf-osm.py`. Its docstring has the Overpass dump command.
