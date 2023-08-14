
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2
}

interface Tile {
  isAir(): boolean;
  isPlayer(): boolean;
  isLock(): boolean;

  colorTile(g: CanvasRenderingContext2D): void;
  moveVertical(dy: number): void;
  moveHorizontal(dx: number): void;
  updateTile(y: number, x: number): void;
}

class Air implements Tile {
  isAir() { return true; }
  isPlayer() { return false; }
  isLock() { return false; }

  colorTile(g: CanvasRenderingContext2D): void { }

  moveVertical(dy: number): void {
    moveToTile(playerx, playery + dy);
  }

  moveHorizontal(dx: number): void {
    moveToTile(playerx + dx, playery);
  }

  updateTile(y: number, x: number): void { }
}

class Flux implements Tile {
  isAir() { return false; }
  isPlayer() { return false; }
  isLock() { return false; }

  colorTile(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#ccffcc";
  }

  moveVertical(dy: number): void {
    moveToTile(playerx, playery + dy);
  }

  moveHorizontal(dx: number): void {
    moveToTile(playerx + dx, playery);
  }

  updateTile(y: number, x: number): void { }
}

class Unbreakable implements Tile {
  isAir() { return false; }
  isPlayer() { return false; }
  isLock() { return false; }

  colorTile(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#999999";
  }

  moveVertical(dy: number): void { }
  moveHorizontal(dx: number): void { }
  updateTile(y: number, x: number): void { }
}

class Player implements Tile {
  isAir() { return false; }
  isPlayer() { return true; }
  isLock() { return false; }

  colorTile(g: CanvasRenderingContext2D): void { }
  moveVertical(dy: number): void { }
  moveHorizontal(dx: number): void { }
  updateTile(y: number, x: number): void { }
}

class Stone implements Tile {
  isAir() { return false; }
  isPlayer() { return false; }
  isLock() { return false; }

  colorTile(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#0000cc";
  }
  moveVertical(dy: number): void { }

  moveHorizontal(dx: number): void {
    if (map[playery][playerx + dx + dx].isAir()
      && !map[playery + 1][playerx + dx].isAir()) {

      map[playery][playerx + dx + dx] = this;
      moveToTile(playerx + dx, playery);
    }
  }

  updateTile(y: number, x: number): void {
    if (map[y + 1][x].isAir()) {
      map[y + 1][x] = new FallingStone();
      map[y][x] = new Air();
    }
  }
}

class FallingStone implements Tile {
  isAir() { return false; }
  isPlayer() { return false; }
  isLock() { return false; }

  colorTile(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#0000cc";
  }
  moveVertical(dy: number): void { }
  moveHorizontal(dx: number): void { }

  updateTile(y: number, x: number): void {
    map[y][x] = new Stone();
  }
}

class Box implements Tile {
  isAir() { return false; }
  isPlayer() { return false; }
  isLock() { return false; }
  
  colorTile(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#8b4513";
  }
  moveVertical(dy: number): void { }

  moveHorizontal(dx: number): void {
    if (map[playery][playerx + dx + dx].isAir()
      && !map[playery + 1][playerx + dx].isAir()) {

      map[playery][playerx + dx + dx] = this;
      moveToTile(playerx + dx, playery);
    }
  }

  updateTile(y: number, x: number): void {
    if (map[y + 1][x].isAir()) {
      map[y + 1][x] = new FallingBox();
      map[y][x] = new Air();
    }
  }
}

class FallingBox implements Tile {
  isAir() { return false; }
  isPlayer() { return false; }
  isLock() { return false; }
  
  colorTile(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#8b4513";
  }
  moveVertical(dy: number): void { }
  moveHorizontal(dx: number): void { }

  updateTile(y: number, x: number): void {
    map[y][x] = new Box();
  }
}

interface KeyStrategy {
  colorTile(g: CanvasRenderingContext2D): void;
}

class Key implements Tile, KeyStrategy {
  colorCode: string;
  constructor(colorCode: string) {
    this.colorCode = colorCode;
  }

  isAir() { return false; }
  isPlayer() { return false; }
  isLock() { return false; }
  
  colorTile(g: CanvasRenderingContext2D): void {
    g.fillStyle = this.colorCode;
  }

  moveVertical(dy: number): void {
    removeLock();
    moveToTile(playerx, playery + dy);
  }

  moveHorizontal(dx: number): void {
    removeLock();
    moveToTile(playerx + dx, playery);
  }
  updateTile(y: number, x: number): void { }
}

class Lock1 implements Tile {
  isAir() { return false; }
  isPlayer() { return false; }
  isLock() {
    return true;
  }
  
  colorTile(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#ffcc00";
  }
  moveVertical(dy: number): void { }
  moveHorizontal(dx: number): void { }
  updateTile(y: number, x: number): void { }
}

class Lock2 implements Tile {
  isAir() { return false; }
  isPlayer() { return false; }
  isLock() {
    return true;
  }
  
  colorTile(g: CanvasRenderingContext2D): void {
    g.fillStyle = "#00ccff";
  }
  moveVertical(dy: number): void { }
  moveHorizontal(dx: number): void { }
  updateTile(y: number, x: number): void { }
}

interface Input {
  isUp(): boolean;
  isDown(): boolean;
  isLeft(): boolean;
  isRight(): boolean;

  move(): void;
}

class Up implements Input {
  isUp(): boolean {
    return true;
  }

  isDown(): boolean {
    return false;
  }

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return false;
  }

  move(): void {
    map[playery + -1][playerx].moveVertical(-1);
  }
}

class Down implements Input {
  isUp(): boolean {
    return false;
  }

  isDown(): boolean {
    return true;
  }

  isLeft(): boolean {
    return false;
  }
  
  isRight(): boolean {
    return false;
  }

  move(): void {
    map[playery + 1][playerx].moveVertical(1);
  }
}

class Left implements Input {
  isUp(): boolean {
    return false;
  }

  isDown(): boolean {
    return false;
  }

  isLeft(): boolean {
    return true;
  }
  
  isRight(): boolean {
    return false;
  }

  move(): void {
    map[playery][playerx + -1].moveHorizontal(-1);
  }
}

class Right implements Input {
  isUp(): boolean {
    return false;
  }

  isDown(): boolean {
    return false;
  }

  isLeft(): boolean {
    return false;
  }
  
  isRight(): boolean {
    return true;
  }

  move(): void {
    map[playery][playerx + 1].moveHorizontal(1);
  }
}

let playerx = 1;
let playery = 1;
let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
let map: Tile[][];

let inputs: Input[] = [];

function convertTile(tile: RawTile) {
  switch(tile) {
    case RawTile.AIR: return new Air();
    case RawTile.FLUX: return new Flux();
    case RawTile.UNBREAKABLE: return new Unbreakable();
    case RawTile.PLAYER: return new Player();
    case RawTile.STONE: return new Stone();
    case RawTile.FALLING_STONE: return new FallingStone();
    case RawTile.BOX: return new Box();
    case RawTile.FALLING_BOX: return new FallingBox();
    case RawTile.KEY1: return new Key("#ffcc00");
    case RawTile.LOCK1: return new Lock1();
    case RawTile.KEY2: return new Key("#00ccff");
    case RawTile.LOCK2: return new Lock2();
    default: throw new Error('This is wrong tile: ' + tile);
  }
}

function initTile() {
  map = new Array(rawMap.length);

  for (let y = 0; y < rawMap.length; y++) {
    map[y] = new Array(rawMap[y].length);

    for (let x = 0; x < rawMap[y].length; x++) {
      map[y][x] = convertTile(rawMap[y][x]);
    }
  }
}

function removeLock() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      isLock(x, y);
    }
  }
}

function isLock(x: number, y: number) {
  if (map[y][x].isLock()) {
    map[y][x] = new Air();
  }
}

function moveToTile(newx: number, newy: number) {
  map[playery][playerx] = new Air();
  map[newy][newx] = new Player();
  playerx = newx;
  playery = newy;
}

function update() {
  moveInputs();

  updateTiles();
}

function updateTiles() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].updateTile(y, x);
    }
  }
}

function moveInputs() {
  while (inputs.length > 0) {
    inputs.pop().move();
  }
}

function draw() {
  let g = prepareCanvas();

  drawMap(g);
  drawPlayer(g);
}

function prepareCanvas() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);

  return g;
}

function drawPlayer(g: CanvasRenderingContext2D) {
  g.fillStyle = "#ff0000";
  g.fillRect(playerx * TILE_SIZE, playery * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function drawMap(g: CanvasRenderingContext2D) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      colorTiles(y, x, g);

      drawCanvas(y, x, g);
    }
  }
}

function drawCanvas(y: number, x: number, g: CanvasRenderingContext2D) {
  if (!map[y][x].isAir() && !map[y][x].isPlayer())
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function colorTiles(y: number, x: number, g: CanvasRenderingContext2D) {
  map[y][x].colorTile(g);
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  initTile();
  gameLoop();
}

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", e => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});

