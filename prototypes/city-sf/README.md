# City desktop prototype

The JunOS desktop as a 3D wireframe of San Francisco (Three.js, AWS terrain tiles, an OpenStreetMap snapshot).
Desktop icons float over landmarks; clicking one flies the camera there.

- Run: any static server that serves this folder at `/files/`, e.g. the superpowers brainstorm server; open `/files/city-sf.html`.
  `#cam=x,y,z,tx,ty,tz` opens a fixed camera view.
- Edit apps, colours, islands, the camera and its motion timings (`MOTION`) in `city-config.js`. Each `city-*.js` module builds one layer;
  `city-camera.js` runs camera flights as orbit legs (yaw / pitch / dist around a target).
- Check the motion: `node trace.mjs [url] [app ids...]` drives headless Chrome in real time, opens and closes each app, and asserts
  leg durations, the straight dolly, the vertical leader line, the final framing and the return view. Run it after touching motion.
- Rebuild the building snapshot with `build-sf-osm.py` (its docstring has the Overpass dump command).
