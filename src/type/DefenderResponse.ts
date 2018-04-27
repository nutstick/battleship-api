import { Property } from 'ts-express-decorators';
import { Board, IShipListDocument } from '../models/Board';
import { Ship } from '../models/Ship';

export class DefenderResponse {
  constructor(command: string, board: Board, ship: Ship) {
    this.message = `Complete place ${ship.type} at `
      + `${ship.squares.map((sq) => `(${sq.x}, ${sq.y})`).join()}.`;
    switch (command) {
      case 'StateChange':
        this.message = `${this.message} Your turn is complete. Game state is changing.`;
        break;
      default: break;
    }

    this.success = true;
    this.remainingShip = board.shipList;
  }
  @Property()
  success: boolean;
  @Property()
  message: string;
  @Property()
  remainingShip: IShipListDocument;
}
