import { Changes, Collection, Index, Instance, Model, ObjectID, Property } from 'iridium';

export interface ISquareDocument {
  x: number;
  y: number;
  hitted?: boolean;
}

const Square = {
  x: Number,
  y: Number,
  hitted: Boolean,
};

export interface IShipDocument {
  _id?: string;
  board: string;
  squares: ISquareDocument[];
  type: string;
}

@Index({ 'board': 1, 'squares.x': 1, 'squares.y': 1 })
@Collection('battleship')
export class Ship extends Instance<IShipDocument, Ship> implements IShipDocument {
  @ObjectID
  _id?: string;

  @Property(String, true)
  board: string;

  @Property([Square], true)
  squares: ISquareDocument[];

  @Property(/^(battleship|cruiser|destroyer|submarine)$/)
  type: string;

  static onCreating(ship: IShipDocument) {
    ship.squares = ship.squares.map(({ x, y }) => ({
      x,
      y,
      hitted: false,
    }));
  }
}
