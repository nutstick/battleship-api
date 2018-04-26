import { Changes, Collection, Index, Instance, Model, ObjectID, Property, Transform } from 'iridium';
import { Property as Prop } from 'ts-express-decorators';
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
  @Prop()
  _id: string;

  @Transform(
    (value) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`,
    (value) => value.toLowerCase(),
  )
  @Property(/^(start|attacking|end)$/, false)
  // @Prop()
  state: string;
  @Property(/^(start|attacking|end)$/, false)
  // @Prop()
  move: number;

  @Property(ShipList, true)
  // @Prop()
  avaliable: IShipListDocument;

  @Property(ShipList, true)
  // @Prop()
  notSank: IShipListDocument;

  @Property(Date, true)
  // @Prop()
  createAt: Date;
  @Property(Date, true)
  // @Prop()
  updateAt: Date;

  static onCreating(board: IBoardDocument) {
    board.state = 'start';
    board.moves = 0;
    board.avaliable = {
      battleship: 1,
      cruisers: 2,
      destroyers: 3,
      submarines: 4,
    };
    board.notSank = {
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
