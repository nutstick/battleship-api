import { Changes, Collection, Index, Instance, Model, ObjectID, Property, Transform } from 'iridium';
import { IShipDocument } from '../Ship';

export interface IBoardDocument {
  _id?: string;
  state?: string;
  moves?: number;

  avaliable?: IShipListDocument;
  notSank?: IShipListDocument;

  createAt?: Date;
  updateAt?: Date;
}

export interface IShipListDocument {
  battleship: number;
  cruisers: number;
  destroyers: number;
  submarines: number;
}

const ShipList = {
  battleship: Number,
  cruisers: Number,
  destroyers: Number,
  submarines: Number,
};

@Collection('boards')
export class Board extends Instance<IBoardDocument, Board> implements IBoardDocument {
  @ObjectID
  _id: string;

  @Transform(
    (value) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`,
    (value) => value.toLowerCase(),
  )
  @Property(/^(start|attacking|end)$/, false)
  state: string;
  @Property(Number)
  moves: number;

  @Property(ShipList, true)
  avaliable: IShipListDocument;

  @Property(ShipList, true)
  notSank: IShipListDocument;

  @Property(Date, true)
  createAt: Date;
  @Property(Date, true)
  updateAt: Date;

  static onCreating(board: IBoardDocument) {
    board.state = board.state || 'start';
    board.moves = board.moves || 0;
    board.avaliable = board.avaliable || {
      battleship: 1,
      cruisers: 2,
      destroyers: 3,
      submarines: 4,
    };
    board.notSank = board.notSank || {
      battleship: 1,
      cruisers: 2,
      destroyers: 3,
      submarines: 4,
    };
    board.createAt = new Date();
    board.updateAt = new Date();
  }

  static onSaving(board: Board, changes: Changes) {
    board.updateAt = new Date();
  }
}
