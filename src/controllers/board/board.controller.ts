import { Controller, Delete, Get, PathParams, Post, Put, Required, Status } from 'ts-express-decorators';
import { Returns } from 'ts-express-decorators/lib/swagger';
import { BadRequest, InternalServerError, NotFound } from 'ts-httpexceptions';
import { Board } from '../../models/Board';
import { DbService } from '../../services/DbService.service';
import { AttackerController } from '../attacker/attacker.controller';
import { DefenderController } from '../defender/defender.controller';

@Controller('/boards', AttackerController, DefenderController)
export class BoardController {
  constructor(
    private dbService: DbService,
  ) {
  }

  @Get('/:boardId')
  @Returns(Board)
  async get(@Required() @PathParams('boardId') boardId: string): Promise<Board> {
    const board = await this.dbService.db.Board.findOne(boardId);

    if (board) {
      return board;
    }

    throw new NotFound('Board not found');
  }

  @Post('/')
  @Status(201)
  @Returns(Board)
  async save() {
    try {
      return await this.dbService.db.Board.insert({});
    } catch (err) {
      throw new InternalServerError('Error on inserting new board');
    }
  }

  /**
   *
   * @param id
   * @returns {{id: string, name: string}}
   */
  @Delete('/:boardId')
  @Status(204)
  async remove(@PathParams('boardId') @Required() boardId: string): Promise<void> {
    const count = await this.dbService.db.Board.find({ _id: boardId }).count();

    if (!count) {
      throw new NotFound('Board not found');
    }
    try {
      await this.dbService.db.Board.remove({ _id: boardId });
      return null;
    } catch (err) {
      console.log(err);
      throw new InternalServerError('Error on removing a board');
    }
  }

  @Get('/')
  async getAllBoards(): Promise<Board[]> {
    return await this.dbService.db.Board.find().toArray();
  }
}
