export const ASSETS = {
  handheld: './assets/models/gameboy.glb',
  cartridge: null,
  cover: './assets/cartridge/dungeon-wanted.png',
  coverFemale: './assets/cartridge/dungeon-wanted-female.png',
  title: './assets/title/dungeon-background.png',
  logo: './assets/title/dungeon-logo.png',
  tiles: './assets/tiles/NEW Dungeons (v2).png',
  overworld: './assets/tiles/Old Tilesets/Overworld (GameboyBW).png',
  villageTiles: './assets/tiles/NEW Overworld (Classic)(v2).png',
  villagers: './assets/tiles/Old Tilesets/Sprites (GameboyBW).png',
};
export const VIEWS = {
  front: { x: 0, y: 0, z: 0, span: 0.06, width: 0.08 },
  bottom: { x:-0.24, y:0, z:0, span:0.13, width:0.095 },
  top: { x: 0.48, y: -0.12, z: -0.035, span: 0.10, width: 0.12 },
  left: { x: 0.10, y: 0.55, z: -0.045, span: 0.099, width: 0.105 },
  right: { x: 0.10, y: -0.55, z: 0.045, span: 0.099, width: 0.105 },
  rear: { x: 0.12, y: Math.PI, z: 0, span: 0.19, width: 0.13 },
};
export const PALETTE = ['#c4cf91', '#8e9f58', '#4c623b', '#203323'];
export const DIRECTIONS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
