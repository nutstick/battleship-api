import { Model } from 'iridium';
import { ModelSpecificInstanceConstructor } from 'iridium/dist/lib/ModelInterfaces';
import { Service } from 'ts-express-decorators';
import { database } from '../models';
import { IShipDocument, ISquareDocument, Ship } from '../models/Ship';

const size = {
  battleship: 4,
  cruiser: 3,
  destroyer: 2,
  submarine: 1,
};

const directionVector = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
};

@Service()
export class ShipService {
  constructor() {
    this.ship = database.Ship;
    this.Instance = database.Ship.Instance;
  }

  private squareOfShip(type: string, x: number, y: number, direction: string): ISquareDocument[] {
    return new Array(size[type]).fill(0).map((_, index) => ({
      x: x + directionVector[direction].x * index,
      y: y + directionVector[direction].y * index,
      hitted: false,
    }));
  }

  public createShip(boardId: string, type: string, x: number, y: number, direction: string) {
    return new this.Instance({
      board: boardId,
      type,
      squares: this.squareOfShip(type, x, y, direction),
    });
  }

  public ship: Model<IShipDocument, Ship>;
  public Instance: ModelSpecificInstanceConstructor<IShipDocument, Ship>;
}
