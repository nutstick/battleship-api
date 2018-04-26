import { ControllerService, ExpressApplication } from '@tsed/common';
import { ObjectId } from 'bson';
import { expect } from 'chai';
import * as request from 'supertest';
import { bootstrap, Done, inject } from 'ts-express-decorators/lib/testing';
import { database, Database } from '../../../../src/models';
import { ISquareDocument } from '../../../../src/models/Ship';
import { Server } from '../../../../src/Server';

// TODO: Generic functionion?
function shipSqaures(type: string, x: number, y: number, direction: string) {
  const size = {
    battleship: 4,
    cruisers: 3,
    destroyers: 2,
    submarines: 1,
  };

  const directionVector = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    right: { x: 1, y: 0 },
    left: { x: -1, y: 0 },
  };

  return new Array(size[type]).fill(0).map((_, index) => ({
    x: x + directionVector[direction].x * index,
    y: y + directionVector[direction].y * index,
  }));
}

async function initMockBoard(database: Database) {
  const board = await database.Board.insert({});
  const ships = await database.Ship.insert([{
    board: board._id,
    squares: [{ x: 0, y: 0 }],
    type: string,
  }]);
}

describe('Board Controller', () => {
  beforeEach(bootstrap(Server));
  describe('POST /api/boards/:boardId/attacker/attack', () => {
    beforeEach((done) => {
      Promise.all([database.Board.remove(), database.Ship.remove()]).then(() => done());
    });

    it('should return all boards',
      inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {

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

            const results = JSON.parse(response.text);

            expect(results).to.be.an('array');
            expect(results.length).to.equals(2);

            done();
          });
    }));
  });
});
