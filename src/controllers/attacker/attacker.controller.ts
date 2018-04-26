import { BodyParams, Controller, MergeParams, PathParams, Post, Required } from 'ts-express-decorators';
import { Returns } from 'ts-express-decorators/lib/swagger';
import { NotFound, BadRequest } from 'ts-httpexceptions';
import { DbService } from '../../services/DbService.service';
import { AttackerResponse } from '../../type/AttackerResponse';

@Controller('/:boardId/attacker')
@MergeParams()
export class AttackerController {
  constructor(
    private dbService: DbService,
  ) {
  }

  @Post('/attack')
  @Returns(AttackerResponse)
  async attack(
    @Required() @PathParams('boardId') boardId: string,
    @Required() @BodyParams('x') x: number,
    @Required() @BodyParams('y') y: number,
  ): Promise<AttackerResponse> {
    const board = await this.dbService.db.Board.findOne(boardId);

    if (!board) {
      // TODO: Error
      throw new NotFound(`No board match with ${boardId}`);
    }
    // TODO: Enum state
    if (board.state !== 'Attacking') {
      if (board.state === 'End') {
        throw new BadRequest('Game is ended');
      } else {
        throw new BadRequest('Not ready to attack');
      }
    }

    board.move++;

    const shipsCursor = this.dbService.db.Ship.find({
      board: boardId,
      square: { x, y },
    });
    const count = await shipsCursor.count();

    if (count === 0) {
      return new AttackerResponse({ command: 'Miss' });
    }
    if (count > 1) {
      // TODO: Error
      throw new Error('');
    }

    const [ship] = await shipsCursor.toArray();
    const square = ship.squares.find((square) => {
      return square.x === x && square.y === y;
    });

    if (square) {
      return new AttackerResponse({ command: 'Same' });
    }

    square.hitted = true;

    if (ship.squares.every((square) => square.hitted)) {
      if (board.notSank[board.type] >= 1) {
        board.notSank[board.type]--;
      }

      const sumSankShip = Object.keys(board.notSank)
        .reduce((sum, key) => sum + board.notSank[key], 0);

      await Promise.all([
        ship.save(),
        board.save(),
      ]);

      if (sumSankShip === 0) {
        return new AttackerResponse({ command: 'Win', board });
      }

      return new AttackerResponse({ command: 'Sank', ship });
    }

    try {
      await Promise.all([
        ship.save(),
        board.save(),
      ]);

      return new AttackerResponse({ command: 'Hit' });
    } catch (err) {
      throw new Error(err);
    }
  }
}
