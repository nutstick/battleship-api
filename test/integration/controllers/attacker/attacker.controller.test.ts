import { ControllerService, ExpressApplication } from '@tsed/common';
import { ObjectId } from 'bson';
import { expect } from 'chai';
import * as request from 'supertest';
import { bootstrap, Done, inject } from 'ts-express-decorators/lib/testing';
import { database, Database } from '../../../../src/models';
import { ISquareDocument } from '../../../../src/models/Ship';
import { Server } from '../../../../src/Server';
import { ShipService } from '../../../../src/services/Ship.service';

const createShips = (shipService, board) => [
  shipService.createShip(board._id, 'battleship', 0, 0, 'right'),
  shipService.createShip(board._id, 'submarine', 3, 6, 'right'),
  shipService.createShip(board._id, 'submarine', 7, 7, 'right'),
  shipService.createShip(board._id, 'cruiser', 9, 8, 'down'),
];

describe('Attacker Controller', () => {
  beforeEach(bootstrap(Server));

  describe('POST /api/boards/:boardId/attacker/attack', () => {
    beforeEach((done) => {
      Promise.all([database.Board.remove(), database.Ship.remove()]).then(() => done());
    });

    it('should return Hit at (0, 0)',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 0,
          notSank: { battleship: 1, cruiser: 1, destroyer: 0, submarine: 2 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        await Promise.all(createShips(shipService, board).map((ship) => ship.save()));

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 0,
            y: 0,
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = JSON.parse(response.text);
            expect(result).to.be.an('object');
            expect(result.message).to.be.an('string');
            expect(result.message).to.equals('Hit.');

            // Move should increase by 1
            database.Board.findOne(board._id).then(({ moves }) => {
              expect(moves).to.equals(board.moves + 1);
              done();
            });
          });
    }));

    it('should return Hit at (9, 9)',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 0,
          notSank: { battleship: 1, cruiser: 1, destroyer: 0, submarine: 2 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        await Promise.all(createShips(shipService, board).map((ship) => ship.save()));

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 9,
            y: 9,
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = JSON.parse(response.text);
            expect(result).to.be.an('object');
            expect(result.message).to.be.an('string');
            expect(result.message).to.equals('Hit.');

            // Move should increase by 1
            database.Board.findOne(board._id).then(({ moves }) => {
              expect(moves).to.equals(board.moves + 1);
              done();
            });
          });
    }));

    it('should return Battleship Sank',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 3,
          notSank: { battleship: 1, cruiser: 1, destroyer: 0, submarine: 2 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        const ships = createShips(shipService, board);
        ships[0].squares[0].hitted = true;
        ships[0].squares[1].hitted = true;
        ships[0].squares[2].hitted = true;
        await Promise.all(ships.map((ship) => ship.save()));

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 3,
            y: 0,
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = JSON.parse(response.text);
            expect(result).to.be.an('object');
            expect(result.message).to.be.an('string');
            expect(result.message).to.equals('You just sank the Battleship.');

            // Move should increase by 1
            database.Board.findOne(board._id).then(({ moves, notSank }) => {
              expect(moves).to.equals(board.moves + 1);
              expect(notSank.battleship).to.equals(board.notSank.battleship - 1);
              done();
            });
          });
    }));

    it('should return Submarine Sank',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 0,
          notSank: { battleship: 1, cruiser: 1, destroyer: 0, submarine: 2 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        const ships = createShips(shipService, board);
        await Promise.all(ships.map((ship) => ship.save()));

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 3,
            y: 6,
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = JSON.parse(response.text);
            expect(result).to.be.an('object');
            expect(result.message).to.be.an('string');
            expect(result.message).to.equals('You just sank the Submarine.');

            // Move should increase by 1
            database.Board.findOne(board._id).then(({ moves, notSank }) => {
              expect(moves).to.equals(board.moves + 1);
              expect(notSank.submarine).to.equals(board.notSank.submarine - 1);
              done();
            });
          });
    }));

    it('should Win a game',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 12,
          notSank: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 1 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        const ships = createShips(shipService, board);
        ships[0].squares[0].hitted = true;
        ships[0].squares[1].hitted = true;
        ships[0].squares[2].hitted = true;
        ships[0].squares[3].hitted = true;
        ships[1].squares[0].hitted = true;
        ships[3].squares[0].hitted = true;
        ships[3].squares[1].hitted = true;
        await Promise.all(ships.map((ship) => ship.save()));

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 7,
            y: 7,
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = JSON.parse(response.text);
            expect(result).to.be.an('object');
            expect(result.message).to.be.an('string');
            expect(result.message).to.equals(`Win !  You completed the game in ${board.moves + 1} moves.`);

            // Move should increase by 1
            database.Board.findOne(board._id).then(({ moves }) => {
              expect(moves).to.equals(board.moves + 1);
              done();
            });
          });
    }));

    it('should return Miss',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 0,
          notSank: { battleship: 1, cruiser: 1, destroyer: 0, submarine: 2 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        await Promise.all(createShips(shipService, board).map((ship) => ship.save()));

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 0,
            y: 1,
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = JSON.parse(response.text);
            expect(result).to.be.an('object');
            expect(result.message).to.be.an('string');
            expect(result.message).to.equals('Missed.');

            // Move should increase by 1
            database.Board.findOne(board._id).then(({ moves }) => {
              expect(moves).to.equals(board.moves + 1);
              done();
            });
          });
    }));

    it('should return Same',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 1,
          notSank: { battleship: 1, cruiser: 1, destroyer: 0, submarine: 2 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        const ships = createShips(shipService, board);
        ships[0].squares[0].hitted = true;
        await Promise.all(ships.map((ship) => ship.save()));

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 0,
            y: 0,
          })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = JSON.parse(response.text);
            expect(result).to.be.an('object');
            expect(result.message).to.be.an('string');
            expect(result.message).to.equals('You already choose this square.');

            // Move be same
            database.Board.findOne(board._id).then(({ moves }) => {
              expect(moves).to.equals(board.moves);
              done();
            });
          });
    }));

    it('should throw Invalid square pick (x < 0)',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 0,
          notSank: { battleship: 1, cruiser: 2, destroyer: 3, submarine: 4 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: -1,
            y: 4,
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = response.text;
            expect(result).to.be.an('string');
            expect(result).to.equals('x should be in range 0 - 9.');

            // Move be same
            database.Board.findOne(board._id).then(({ moves }) => {
              expect(moves).to.equals(board.moves);
              done();
            });
          });
    }));

    it('should throw Invalid square pick (x >= 10)',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 0,
          notSank: { battleship: 1, cruiser: 2, destroyer: 3, submarine: 4 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 10,
            y: 4,
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = response.text;
            expect(result).to.be.an('string');
            expect(result).to.equals('x should be in range 0 - 9.');

            // Move be same
            database.Board.findOne(board._id).then(({ moves }) => {
              expect(moves).to.equals(board.moves);
              done();
            });
          });
    }));

    it('should throw Invalid square pick (y < 0)',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 0,
          notSank: { battleship: 1, cruiser: 2, destroyer: 3, submarine: 4 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 5,
            y: -1,
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = response.text;
            expect(result).to.be.an('string');
            expect(result).to.equals('y should be in range 0 - 9.');

            done();
          });
    }));

    it('should throw Invalid square pick (y >= 10)',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'attacking',
          moves: 0,
          notSank: { battleship: 1, cruiser: 2, destroyer: 3, submarine: 4 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 5,
            y: 10,
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = response.text;
            expect(result).to.be.an('string');
            expect(result).to.equals('y should be in range 0 - 9.');

            done();
          });
    }));

    it('should throw Error board not found',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const _id = new ObjectId().toHexString();
        request(expressApplication)
          .post(`/api/boards/${_id}/attacker/attack`)
          .send({
            x: 0,
            y: 0,
          })
          .set('Accept', 'application/json')
          .expect(404)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = response.text;
            expect(result).to.be.an('string');
            expect(result).to.equals(`No board match with id ${_id}.`);

            done();
          });
    }));

    it('should throw Error when game state is start',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'start',
          moves: 0,
          notSank: { battleship: 1, cruiser: 2, destroyer: 3, submarine: 4 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 0,
            y: 0,
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = response.text;
            expect(result).to.be.an('string');
            expect(result).to.equals(`Not ready to attack.`);

            done();
          });
    }));

    it('should throw Error when game state is end',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
        const board = await database.Board.insert({
          state: 'end',
          moves: 0,
          notSank: { battleship: 1, cruiser: 2, destroyer: 3, submarine: 4 },
          avaliable: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
        });

        request(expressApplication)
          .post(`/api/boards/${board._id}/attacker/attack`)
          .send({
            x: 0,
            y: 0,
          })
          .set('Accept', 'application/json')
          .expect(400)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = response.text;
            expect(result).to.be.an('string');
            expect(result).to.equals(`Game is ended.`);

            done();
          });
    }));
  });
});
