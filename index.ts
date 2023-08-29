
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

interface RawTileValue {
  trasform(): Tile;
}

class AirValue implements RawTileValue {
  trasform(): Tile {
    return new Air();
  }
}

class FluxValue implements RawTileValue {
  trasform(): Tile {
    return new Flux();
  }
}

class UnbreakableValue implements RawTileValue {
  trasform(): Tile {
    return new Unbreakable();
  }
}

class PlayerValue implements RawTileValue {
  trasform(): Tile {
    return new PlayerTile();
  }
}

class StoneValue implements RawTileValue {
  trasform(): Tile {
    return new Stone(new Resting());
  }
}

class FallingStoneValue implements RawTileValue {
  trasform(): Tile {
    return new Stone(new Falling());
  }
}

class BoxValue implements RawTileValue {
  trasform(): Tile {
    return new Box(new Resting());
  }
}

class FallingBoxValue implements RawTileValue {
  trasform(): Tile {
    return new Box(new Falling());
  }
}

class Key1Value implements RawTileValue {
  trasform(): Tile {
    return new Key(YELLOW_KEY);
  }
}

class Key2Value implements RawTileValue {
  trasform(): Tile {
    return new Key(YELLOW_KEY2);
  }
}

class Lock1Value implements RawTileValue {
  trasform(): Tile {
    return new LockTile(YELLOW_KEY);
  }
}

class Lock2Value implements RawTileValue {
  trasform(): Tile {
    return new LockTile(YELLOW_KEY2);
  }
}

class RawTile {
  static readonly AIR = new RawTile(new AirValue());
  static readonly FLUX = new RawTile(new FluxValue());
  static readonly UNBREAKABLE = new RawTile(new UnbreakableValue());
  static readonly PLAYER = new RawTile(new PlayerValue());
  static readonly STONE = new RawTile(new StoneValue());
  static readonly FALLING_STONE = new RawTile(new FallingStoneValue());
  static readonly BOX = new RawTile(new BoxValue());
  static readonly FALLING_BOX = new RawTile(new FallingBoxValue());
  static readonly KEY1 = new RawTile(new Key1Value());
  static readonly LOCK1 = new RawTile(new Key2Value());
  static readonly KEY2 = new RawTile(new Lock1Value());
  static readonly LOCK2 = new RawTile(new Lock2Value());
  
  private constructor(private value: RawTileValue) { }

  transform() {
    return this.value.trasform();
  }
}

const RAW_TILES = [
  RawTile.AIR,
  RawTile.FLUX,
  RawTile.UNBREAKABLE,
  RawTile.PLAYER,
  RawTile.STONE,
  RawTile.FALLING_STONE,
  RawTile.BOX,
  RawTile.FALLING_BOX,
  RawTile.KEY1,
  RawTile.LOCK1,
  RawTile.KEY2,
  RawTile.LOCK2
];

class Player {
  private x = 1;
  private y = 1;

  drawPlayer(g: CanvasRenderingContext2D) {
    g.fillStyle = "#ff0000";
    g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(map: Map, dx: number) {
    map.moveHorizontal(this.x, this.y, dx, this);
  }

  moveVertical(map: Map, dy: number) {
    map.moveVertical(this.x, this.y, dy, this);
  }

  move(map: Map, dx: number, dy: number) {
    this.moveToTile(map, this.x + dx, this.y + dy);
  }

  moveToTile(map: Map, newx: number, newy: number) {
    map.movePlayer(this.x, this.y, newx, newy);
    this.x = newx;
    this.y = newy;
  }

  pushHorizontal(map: Map, tile: Tile, dx: number) {
    map.pushHorizontal(this, this.x, this.y, dx, tile);
  }
}

interface FallingState {
  isFalling(): boolean;
  isResting(): boolean;
  moveHorizontal(map: Map, tile: Tile, dx: number): void;
  drop(map: Map, tile: Tile, x: number, y: number): void;
}

class Falling implements FallingState {
  isFalling() { return true; }
  isResting() { return false; }
  moveHorizontal(map: Map, tile: Tile, dx: number): void { }
  drop(map: Map, tile: Tile, x: number, y: number): void {
    map.drop(tile, x, y);
  }
}

class Resting implements FallingState {
  isFalling() { return false; }
  isResting() { return true; }
  moveHorizontal(map: Map, tile: Tile, dx: number): void {
    player.pushHorizontal(map, tile, dx);
  }
  drop(map: Map, tile: Tile, x: number, y: number): void { }
}

class FallStrategy {
  constructor(private falling: FallingState) { }

  update(map: Map, tile: Tile, x: number, y: number): void {
    this.falling = map.getBlockOnTopState(x, y + 1);
    this.falling.drop(map, tile, x, y);
  }

  moveHorizontal(map: Map, tile: Tile, dx: number) {
    this.falling.moveHorizontal(map, tile, dx);
  }
}

interface RemoveStrategy {
  check(tile: Tile): boolean;
}

class RemoveLock1 implements RemoveStrategy {
  check(tile: Tile) {
    return tile.isLock1();
  }
}

class RemoveLock2 implements RemoveStrategy {
  check(tile: Tile) {
    return tile.isLock2();
  }
}

interface Tile {
  isAir(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;

  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  moveHorizontal(map: Map, player: Player, dx: number): void;
  moveVertical(map: Map, player: Player, dy: number): void;
  update(map: Map, x: number, y: number): void;
  getBlockOnTopState(): FallingState;
}

class Air implements Tile {
  isAir() { return true; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number): void { }

  moveHorizontal(map: Map, player: Player, dx: number): void {
    player.move(map, dx, 0);
  }

  moveVertical(map: Map, player: Player, dy: number): void {
    player.move(map, 0, dy);
  }
  update(map: Map, x: number, y: number): void { }

  getBlockOnTopState() {
    return new Falling();
  }
}

class Flux implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(map: Map, player: Player, dx: number): void {
    player.move(map, dx, 0);
  }

  moveVertical(map: Map, player: Player, dy: number): void {
    player.move(map, 0, dy);
  }
  update(map: Map, x: number, y: number): void { }
  getBlockOnTopState() {
    return new Resting();
  }
}

class Unbreakable implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number): void { }
  moveVertical(map: Map, player: Player, dy: number): void { }
  update(map: Map, x: number, y: number): void { }
  getBlockOnTopState() {
    return new Resting();
  }
}

class PlayerTile implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number): void { }
  moveHorizontal(map: Map, player: Player, dx: number): void { }
  moveVertical(map: Map, player: Player, dy: number): void { }
  update(map: Map, x: number, y: number): void { }
  getBlockOnTopState() {
    return new Resting();
  }
}

class Stone implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }

  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(map: Map, player: Player, dx: number): void {
    this.fallStrategy.moveHorizontal(map, this, dx);
  }

  moveVertical(map: Map, player: Player, dy: number): void { }
  update(map: Map, x: number, y: number): void {
    this.fallStrategy.update(map, this, x, y);
  }
  getBlockOnTopState() {
    return new Resting();
  }
}

class Box implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }

  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(map: Map, player: Player, dx: number): void {
    this.fallStrategy.moveHorizontal(map, this, dx);
  }

  moveVertical(map: Map, player: Player, dy: number): void { }
  update(map: Map, x: number, y: number): void {
    this.fallStrategy.update(map, this, x, y);
  }
  getBlockOnTopState() {
    return new Resting();
  }
}

class Key implements Tile {
  constructor(private keyConf: keyConfiguration) { }

  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }

  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    this.keyConf.setColor(g, x, y);
  }

  moveHorizontal(map: Map, player: Player, dx: number): void {
    this.keyConf.removeLock();
    player.move(map, dx, 0);
  }

  moveVertical(map: Map, player: Player, dy: number): void {
    this.keyConf.removeLock();
    player.move(map, 0, dy);
  }

  update(map: Map, x: number, y: number): void { }
  getBlockOnTopState() {
    return new Resting();
  }
}

class LockTile implements Tile {
  constructor(private keyConf: keyConfiguration) { }

  isAir() { return false; }
  isLock1() { return this.keyConf.is1(); }
  isLock2() { return !this.keyConf.is1(); }

  draw(g: CanvasRenderingContext2D, x: number, y: number): void {
    this.keyConf.setColor(g, x, y);
  }

  moveHorizontal(map: Map, player: Player, dx: number): void { }
  moveVertical(map: Map, player: Player, dy: number): void { }
  update(map: Map, x: number, y: number): void { }
  getBlockOnTopState() {
    return new Resting();
  }
}

class keyConfiguration {
  constructor(
    private color: string,
    private _1: boolean,
    private removeStrategy: RemoveStrategy
  ) { }

  setColor(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = this.color;
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  is1() { return this._1; }

  removeLock() {
    map.remove(this.removeStrategy);
  }
}

interface Input {
  isRight(): boolean;
  isLeft(): boolean;
  isUp(): boolean;
  isDown(): boolean;

  handle(map: Map, player: Player): void;
}

class Right implements Input {
  isRight() { return true; }
  isLeft() { return false; }
  isUp() { return false; }
  isDown() { return false; }

  handle(map: Map, player: Player) {
    player.moveHorizontal(map, 1);
  }
}

class Left implements Input {
  isRight() { return false; }
  isLeft() { return true; }
  isUp() { return false; }
  isDown() { return false; }

  handle(map: Map, player: Player) {
    player.moveHorizontal(map, -1);
  }
}

class Up implements Input {
  isRight() { return false; }
  isLeft() { return false; }
  isUp() { return true; }
  isDown() { return false; }

  handle(map: Map, player: Player): void {
    player.moveVertical(map, -1);
  }
}

class Down implements Input {
  isRight() { return false; }
  isLeft() { return false; }
  isUp() { return false; }
  isDown() { return true; }

  handle(map: Map, player: Player): void {
    player.moveVertical(map, 1);
  }
}

class Map {
  private map: Tile[][];
  setMap(map: Tile[][]) { this.map = map; }

  constructor() {
    this.setMap(new Array(rawMap.length));
  
    for (let y = 0; y < rawMap.length; y++) {
      this.map[y] = new Array(rawMap[y].length);
  
      for (let x = 0; x < rawMap[y].length; x++) {
        this.map[y][x] = RAW_TILES[rawMap[y][x]].transform();
      }
    }
  }

  update() {
    for (let y = this.map.length - 1; y >= 0; y--) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].update(map, x, y);
      }
    }
  }

  draw(g: CanvasRenderingContext2D) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].draw(g, x, y);
      }
    }
  }

  drop(tile: Tile, x: number, y: number): void {
    this.map[y + 1][x] = tile;
    this.map[y][x] = new Air();
  }

  getBlockOnTopState(x: number, y: number) {
    return this.map[y][x].getBlockOnTopState();
  }

  moveHorizontal(x: number, y: number, dx: number, player: Player) {
    this.map[y][x + dx].moveHorizontal(this, player, dx);
  }

  moveVertical(x: number, y: number, dy: number, player: Player) {
    this.map[y + dy][x].moveHorizontal(this, player, dy);
  }

  isAir(x: number, y: number): boolean {
    return this.map[x][y].isAir();
  }

  pushHorizontal(palyer: Player, x: number, y: number, dx: number, tile: Tile) {
    if (this.isAir(x + dx + dx, y)
      && !this.isAir(x + dx, y + 1)) {
        this.map[y][x + dx + dx] = tile;
        player.moveToTile(map, x + dx, y);
      }
  }

  movePlayer(x: number, y: number, newx: number, newy: number) {
    this.map[y][x] = new Air();
    this.map[newy][newx] = new PlayerTile();
  }

  remove(shouldRemove: RemoveStrategy) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (shouldRemove.check(this.map[y][x])) {
          this.map[y][x] = new Air();
        }
      }
    }
  }
}

let rawMap: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];

let inputs: Input[] = [];
let player = new Player();
let map = new Map();

const YELLOW_KEY = new keyConfiguration("#ffcc00", true, new RemoveLock1());
const YELLOW_KEY2 = new keyConfiguration("#00ccff", false, new RemoveLock2());

function update() {
  handleInputs();
  updateMap();
}

function updateMap() {
  map.update();
}

function handleInputs() {
  while (inputs.length > 0) {
    let current = inputs.pop();
    current.handle(map, player);
  }
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);

  return g;
}

function draw() {
  let g = createGraphics();
  map.draw(g);
  player.drawPlayer(g);
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

