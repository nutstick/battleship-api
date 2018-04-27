import { ControllerService, ExpressApplication } from '@tsed/common';
import { ObjectId } from 'bson';
import { expect } from 'chai';
import * as request from 'supertest';
import { bootstrap, Done, inject } from 'ts-express-decorators/lib/testing';
import { database, Database } from '../../../../src/models';
import { Server } from '../../../../src/Server';
import { ShipService } from '../../../../src/services/Ship.service';

describe('Attacker Controller', () => {
  beforeEach(bootstrap(Server));

  describe('POST /api/boards/:boardId/defender/place', () => {
    beforeEach((done) => {
      Promise.all([database.Board.remove(), database.Ship.remove()]).then(() => done());
    });
    it('should successful place battleship at (0, 0) to right', inject([ExpressApplication, Done],
        async (expressApplication: ExpressApplication, done: Done) => {
          const board = await database.Board.insert({
            state: 'start',
            moves: 0,
            notSank: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
            avaliable: { battleship: 1, cruiser: 2, destroyer: 3, submarine: 4 },
          });

          request(expressApplication)
            .post(`/api/boards/${board._id}/defender/place`)
            .send({
              type: 'battleship',
              x: 0,
              y: 0,
              direction: 'right',
            })
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, response: any) => {
              if (err) {
                throw (err);
              }

              const result = JSON.parse(response.text);
              expect(result).to.be.an('object');
              expect(result.success).to.equals(true);
              expect(result.message).to.equals('Complete place battleship at (0, 0),(1, 0),(2, 0),(3, 0).');

              database.Board.findOne(board._id).then(({ avaliable, notSank }) => {
                expect(avaliable).to.be.an('object');
                expect(avaliable.battleship).to.equals(0);
                expect(notSank).to.be.an('object');
                expect(notSank.battleship).to.equals(1);
                done();
              });
            });
    }));

    it('should successful place battleship at (0, 0) to right and change the state', inject([ExpressApplication, Done],
        async (expressApplication: ExpressApplication, done: Done) => {
          const board = await database.Board.insert({
            state: 'start',
            moves: 0,
            notSank: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
            avaliable: { battleship: 1, cruiser: 0, destroyer: 0, submarine: 0 },
          });

          request(expressApplication)
            .post(`/api/boards/${board._id}/defender/place`)
            .send({
              type: 'battleship',
              x: 0,
              y: 0,
              direction: 'right',
            })
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, response: any) => {
              if (err) {
                throw (err);
              }

              const result = JSON.parse(response.text);
              expect(result).to.be.an('object');
              expect(result.success).to.equals(true);
              expect(result.message).to.equals('Complete place battleship at (0, 0),(1, 0),(2, 0),(3, 0).' +
                ' Your turn is complete. Game state is changing.');

              database.Board.findOne(board._id).then(({ state, avaliable, notSank }) => {
                expect(state).to.be.a('string');
                expect(state).to.equals('Attacking');
                expect(avaliable).to.be.an('object');
                expect(avaliable.battleship).to.equals(0);
                expect(notSank).to.be.an('object');
                expect(notSank.battleship).to.equals(1);
                done();
              });
            });
    }));

    it('should throw board not found', inject([ExpressApplication, Done],
        async (expressApplication: ExpressApplication, done: Done) => {
          const id = new ObjectId().toHexString();

          request(expressApplication)
            .post(`/api/boards/${id}/defender/place`)
            .send({
              type: 'battleship',
              x: 0,
              y: 0,
              direction: 'right',
            })
            .set('Accept', 'application/json')
            .expect(404)
            .end((err, response: any) => {
              if (err) {
                throw (err);
              }

              const result = response.text;
              expect(result).to.be.an('string');
              expect(result).to.equals('Board not found');
              done();
            });
    }));

    it('should throw error when board state is already change.', inject([ExpressApplication, Done],
        async (expressApplication: ExpressApplication, done: Done) => {
          const board = await database.Board.insert({
            state: 'attacking',
            moves: 0,
            notSank: { battleship: 0, cruiser: 0, destroyer: 0, submarine: 0 },
            avaliable: { battleship: 1, cruiser: 0, destroyer: 0, submarine: 0 },
          });

          request(expressApplication)
            .post(`/api/boards/${board._id}/defender/place`)
            .send({
              type: 'battleship',
              x: 0,
              y: 0,
              direction: 'right',
            })
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, response: any) => {
              if (err) {
                throw (err);
              }

              const result = response.text;
              expect(result).to.be.an('string');
              expect(result).to.equals('Start state has done.');
              done();
            });
    }));

    it('should not able to place non remaining ship.', inject([ExpressApplication, Done],
        async (expressApplication: ExpressApplication, done: Done) => {
          const board = await database.Board.insert({
            state: 'start',
            moves: 0,
            notSank: { battleship: 0, cruiser: 2, destroyer: 3, submarine: 4 },
            avaliable: { battleship: 1, cruiser: 0, destroyer: 0, submarine: 0 },
          });

          request(expressApplication)
            .post(`/api/boards/${board._id}/defender/place`)
            .send({
              type: 'submarine',
              x: 8,
              y: 8,
              direction: 'up',
            })
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, response: any) => {
              if (err) {
                throw (err);
              }

              const result = response.text;
              expect(result).to.be.an('string');
              expect(result).to.equals('No more submarine can be place.');
              done();
            });
    }));

    it('should throw illegal to place ship at same square.',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
          const board = await database.Board.insert({
            state: 'start',
            moves: 0,
            notSank: { battleship: 0, cruiser: 2, destroyer: 3, submarine: 3 },
            avaliable: { battleship: 1, cruiser: 0, destroyer: 2, submarine: 1 },
          });
          await Promise.all([
            shipService.createShip(board._id, 'cruiser', 9, 9, 'left').save(),
            shipService.createShip(board._id, 'destroyer', 6, 7, 'down').save(),
          ]);

          request(expressApplication)
            .post(`/api/boards/${board._id}/defender/place`)
            .send({
              type: 'submarine',
              x: 6,
              y: 7,
              direction: 'up',
            })
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, response: any) => {
              if (err) {
                throw (err);
              }

              const result = response.text;
              expect(result).to.be.an('string');
              expect(result).to.equals('Illegal to place ship adjacent with others.');
              done();
            });
    }));

    it('should throw illegal to place ship adjacent with others.',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
          const board = await database.Board.insert({
            state: 'start',
            moves: 0,
            notSank: { battleship: 0, cruiser: 2, destroyer: 3, submarine: 3 },
            avaliable: { battleship: 1, cruiser: 0, destroyer: 2, submarine: 1 },
          });
          await Promise.all([
            shipService.createShip(board._id, 'cruiser', 9, 9, 'left').save(),
            shipService.createShip(board._id, 'destroyer', 6, 7, 'down').save(),
          ]);

          request(expressApplication)
            .post(`/api/boards/${board._id}/defender/place`)
            .send({
              type: 'submarine',
              x: 5,
              y: 7,
              direction: 'up',
            })
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, response: any) => {
              if (err) {
                throw (err);
              }

              const result = response.text;
              expect(result).to.be.an('string');
              expect(result).to.equals('Illegal to place ship adjacent with others.');
              done();
            });
    }));

    it('should throw illegal to place ship diagonal adjacent with others.',
      inject([ShipService, ExpressApplication, Done],
        async (shipService: ShipService, expressApplication: ExpressApplication, done: Done) => {
          const board = await database.Board.insert({
            state: 'start',
            moves: 0,
            notSank: { battleship: 0, cruiser: 2, destroyer: 3, submarine: 3 },
            avaliable: { battleship: 1, cruiser: 0, destroyer: 2, submarine: 1 },
          });
          await Promise.all([
            shipService.createShip(board._id, 'cruiser', 9, 9, 'left').save(),
            shipService.createShip(board._id, 'destroyer', 6, 7, 'down').save(),
          ]);

          request(expressApplication)
            .post(`/api/boards/${board._id}/defender/place`)
            .send({
              type: 'submarine',
              x: 5,
              y: 6,
              direction: 'up',
            })
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, response: any) => {
              if (err) {
                throw (err);
              }

              const result = response.text;
              expect(result).to.be.an('string');
              expect(result).to.equals('Illegal to place ship adjacent with others.');
              done();
            });
    }));
  });
});
