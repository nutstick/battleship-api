import { ObjectID } from 'bson';
import { expect } from 'chai';
import { bootstrap, Done, inject } from 'ts-express-decorators/lib/testing';
import { ShipService } from './Ship.service';

describe('Ship Service', () => {
  describe('getSquare', () => {
    it('should return square of battleship', inject([ShipService, Done], (shipService: ShipService, done: Done) => {
      const boardId = new ObjectID().toHexString();
      const ship = shipService.createShip(boardId, 'battleship', 0, 0, 'right');

      expect(ship.board).to.be.a('string');
      expect(ship.board).to.equals(boardId);
      expect(ship.type).to.be.a('string');
      expect(ship.type).to.equals('battleship');
      expect(ship.squares).to.be.an('array');
      expect(ship.squares.length).to.equals(4);
      expect(ship.squares).to.deep.equals([{
        x: 0,
        y: 0,
        hitted: false,
      }, {
        x: 1,
        y: 0,
        hitted: false,
      }, {
        x: 2,
        y: 0,
        hitted: false,
      }, {
        x: 3,
        y: 0,
        hitted: false,
      }]);

      done();
    }));

    it('should return square of cruiser', inject([ShipService, Done], (shipService: ShipService, done: Done) => {
      const boardId = new ObjectID().toHexString();
      const ship = shipService.createShip(boardId, 'cruiser', 0, 0, 'right');

      expect(ship.board).to.be.a('string');
      expect(ship.board).to.equals(boardId);
      expect(ship.type).to.be.a('string');
      expect(ship.type).to.equals('cruiser');
      expect(ship.squares).to.be.an('array');
      expect(ship.squares.length).to.equals(3);
      expect(ship.squares).to.deep.equals([{
        x: 0,
        y: 0,
        hitted: false,
      }, {
        x: 1,
        y: 0,
        hitted: false,
      }, {
        x: 2,
        y: 0,
        hitted: false,
      }]);

      done();
    }));

    it('should return square of destroyer', inject([ShipService, Done], (shipService: ShipService, done: Done) => {
      const boardId = new ObjectID().toHexString();
      const ship = shipService.createShip(boardId, 'destroyer', 0, 0, 'right');

      expect(ship.board).to.be.a('string');
      expect(ship.board).to.equals(boardId);
      expect(ship.type).to.be.a('string');
      expect(ship.type).to.equals('destroyer');
      expect(ship.squares).to.be.an('array');
      expect(ship.squares.length).to.equals(2);
      expect(ship.squares).to.deep.equals([{
        x: 0,
        y: 0,
        hitted: false,
      }, {
        x: 1,
        y: 0,
        hitted: false,
      }]);

      done();
    }));

    it('should return square of submarine', inject([ShipService, Done], (shipService: ShipService, done: Done) => {
      const boardId = new ObjectID().toHexString();
      const ship = shipService.createShip(boardId, 'submarine', 0, 0, 'right');

      expect(ship.board).to.be.a('string');
      expect(ship.board).to.equals(boardId);
      expect(ship.type).to.be.a('string');
      expect(ship.type).to.equals('submarine');
      expect(ship.squares).to.be.an('array');
      expect(ship.squares.length).to.equals(1);
      expect(ship.squares).to.deep.equals([{
        x: 0,
        y: 0,
        hitted: false,
      }]);

      done();
    }));

    it('should return ship to the left', inject([ShipService, Done], (shipService: ShipService, done: Done) => {
      const boardId = new ObjectID().toHexString();
      const ship = shipService.createShip(boardId, 'cruiser', 4, 0, 'left');

      expect(ship.board).to.be.a('string');
      expect(ship.board).to.equals(boardId);
      expect(ship.type).to.be.a('string');
      expect(ship.type).to.equals('cruiser');
      expect(ship.squares).to.be.an('array');
      expect(ship.squares.length).to.equals(3);
      expect(ship.squares).to.deep.equals([{
        x: 4,
        y: 0,
        hitted: false,
      }, {
        x: 3,
        y: 0,
        hitted: false,
      }, {
        x: 2,
        y: 0,
        hitted: false,
      }]);

      done();
    }));

    it('should return ship to the up', inject([ShipService, Done], (shipService: ShipService, done: Done) => {
      const boardId = new ObjectID().toHexString();
      const ship = shipService.createShip(boardId, 'cruiser', 4, 8, 'up');

      expect(ship.board).to.be.a('string');
      expect(ship.board).to.equals(boardId);
      expect(ship.type).to.be.a('string');
      expect(ship.type).to.equals('cruiser');
      expect(ship.squares).to.be.an('array');
      expect(ship.squares.length).to.equals(3);
      expect(ship.squares).to.deep.equals([{
        x: 4,
        y: 8,
        hitted: false,
      }, {
        x: 4,
        y: 7,
        hitted: false,
      }, {
        x: 4,
        y: 6,
        hitted: false,
      }]);

      done();
    }));

    it('should return ship to the up', inject([ShipService, Done], (shipService: ShipService, done: Done) => {
      const boardId = new ObjectID().toHexString();
      const ship = shipService.createShip(boardId, 'cruiser', 9, 1, 'down');

      expect(ship.board).to.be.a('string');
      expect(ship.board).to.equals(boardId);
      expect(ship.type).to.be.a('string');
      expect(ship.type).to.equals('cruiser');
      expect(ship.squares).to.be.an('array');
      expect(ship.squares.length).to.equals(3);
      expect(ship.squares).to.deep.equals([{
        x: 9,
        y: 1,
        hitted: false,
      }, {
        x: 9,
        y: 2,
        hitted: false,
      }, {
        x: 9,
        y: 3,
        hitted: false,
      }]);

      done();
    }));
  });
});
