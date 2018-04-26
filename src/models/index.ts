import { Core, Model } from 'iridium';
import { mongodb } from '../config';
import { Board, IBoardDocument } from '../models/Board';
import { IShipDocument, Ship } from '../models/Ship';

export class Database extends Core {
  Board = new Model<IBoardDocument, Board>(this, Board);
  Ship = new Model<IShipDocument, Ship>(this, Ship);
}

export const database = new Database({ database: mongodb });
