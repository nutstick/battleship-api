import { ControllerService, ExpressApplication } from '@tsed/common';
import { ObjectId } from 'bson';
import { expect } from 'chai';
import * as request from 'supertest';
import { bootstrap, Done, inject } from 'ts-express-decorators/lib/testing';
import { BoardController } from '../../../../src/controllers/board/board.controller';
import { database } from '../../../../src/models';
import { Server } from '../../../../src/Server';
import { BoardService } from '../../../../src/services/Board.service';

describe('Board Controller', () => {
  beforeEach(bootstrap(Server));

  describe('GET /api/boards', () => {
    beforeEach((done) => {
      database.Board.remove().then(() => {
        done();
      });
    });

    it('should return all boards',
      inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
        await database.Board.insert([{}, {}]);

        request(expressApplication)
          .get('/api/boards')
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

    it('should return no boards',
      inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
        request(expressApplication)
          .get('/api/boards')
          .expect(200)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const results = JSON.parse(response.text);

            expect(results).to.be.an('array');
            expect(results.length).to.equals(0);

            done();
          });
    }));
  });

  describe('POST /api/boards', () => {
    beforeEach((done) => {
      database.Board.remove().then(() => {
        done();
      });
    });

    it('should create a board',
      inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
        request(expressApplication)
          .post('/api/boards')
          .expect(201)
          .end((err, response: any) => {
            if (err) {
              throw (err);
            }

            const result = JSON.parse(response.text);
            expect(result).to.be.an('object');
            expect(result.state).to.equals('start');
            expect(result.moves).to.equals(0);
            expect(result.avaliable).to.deep.equals({
              battleship: 1,
              cruiser: 2,
              destroyer: 3,
              submarine: 4,
            });
            expect(result.notSank).to.deep.equals({
              battleship: 1,
              cruiser: 2,
              destroyer: 3,
              submarine: 4,
            });

            done();
          });
    }));
  });

  describe('GET /api/boards/:boardId', () => {
    beforeEach((done) => {
      database.Board.remove().then(() => {
        done();
      });
    });

    it('should get a board',
      inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
        const _id = new ObjectId().toHexString();
        await database.Board.insert([{ _id }]);
        request(expressApplication)
          .get(`/api/boards/${_id}`)
          .expect(200)
          .end((err, response: any) => {
            if (err) {
                throw (err);
            }

            const result = JSON.parse(response.text);
            expect(result).to.be.an('object');
            expect(result._id).to.equals(_id);
            done();
          });
    }));

    it('should return Not found',
      inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
        const _id = new ObjectId().toHexString();
        request(expressApplication)
          .get(`/api/boards/${_id}`)
          .expect(404, 'Board not found')
          .end((err, res) => {
            if (err) { return done(err); }
            done();
          });
    }));
  });

  describe('DELETE /api/boards/:boardId', () => {
    beforeEach((done) => {
      database.Board.remove().then(() => {
        done();
      });
    });

    it('should delete a board',
      inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
        const _id = new ObjectId().toHexString();
        await database.Board.insert([{ _id }]);
        request(expressApplication)
          .delete(`/api/boards/${_id}`)
          .expect(204)
          .end((err, response: any) => {
            if (err) { return done(err); }
            done();
          });
    }));

    it('should return Not found',
      inject([ExpressApplication, Done], async (expressApplication: ExpressApplication, done: Done) => {
        const _id = new ObjectId().toHexString();
        request(expressApplication)
          .delete(`/api/boards/${_id}`)
          .expect(404, 'Board not found')
          .end((err, res) => {
            if (err) { return done(err); }
            done();
          });
    }));
  });
});
