import { Property } from 'ts-express-decorators';
import { Board } from '../models/Board';
import { Ship } from '../models/Ship';

export interface IAttackerResponseOptions {
  command: string;
  board?: Board;
  ship?: Ship;
}

export class AttackerResponse {
  constructor({ command, board, ship }: IAttackerResponseOptions) {
    switch (command) {
      case 'Miss':
        this.message = 'Missed.';
        break;
      case 'Hit':
        this.message = 'Hit.';
        break;
      case 'Same':
        this.message = 'You already choose this square.';
        break;
      case 'Sank':
        this.message = `You just sank the ${ship.type.charAt(0).toUpperCase()}${ship.type.slice(1)}`;
        break;
      case 'Win':
        this.message = `Win !  You completed the game in ${board.moves} moves.`;
        break;
      default: break;
    }
  }
  @Property()
  message: string;
}
