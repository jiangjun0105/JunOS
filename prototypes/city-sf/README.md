# City desktop prototype

The JunOS desktop as a 3D wireframe of San Francisco (Three.js, AWS terrain tiles, an OpenStreetMap snapshot).
Desktop icons float over landmarks; clicking one flies the camera there.

- Run: any static server that serves this folder at `/files/`, e.g. the superpowers brainstorm server; open `/files/city-sf.html`.
  `#cam=x,y,z,tx,ty,tz` opens a fixed camera view.
- Edit apps, colours, islands and the camera in `city-config.js`. Each `city-*.js` module builds one layer.
- Rebuild the building snapshot with `build-sf-osm.py` (its docstring has the Overpass dump command).
