import { BodyParams, Controller, MergeParams, PathParams, Post, Required } from 'ts-express-decorators';
import { Returns } from 'ts-express-decorators/lib/swagger';
import { BadRequest, InternalServerError, NotFound } from 'ts-httpexceptions';
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
    // Board border check
    if (x < 0 || x >= 10) {
      throw new BadRequest('x should be in range 0 - 9.');
    }
    if (y < 0 || y >= 10) {
      throw new BadRequest('y should be in range 0 - 9.');
    }

    const board = await this.dbService.db.Board.findOne(boardId);

    // No board found
    if (!board) {
      throw new NotFound(`No board match with ${boardId}.`);
    }
    // TODO: Enum state
    if (board.state !== 'Attacking') {
      if (board.state === 'End') {
        throw new BadRequest('Game is ended.');
      } else {
        throw new BadRequest('Not ready to attack.');
      }
    }

    board.moves++;

    const shipsCursor = this.dbService.db.Ship.find({
      board: boardId,
      squares: {
        $elemMatch: { x, y },
      },
    });
    const count = await shipsCursor.count();

    if (count === 0) {
      await board.save();
      return new AttackerResponse({ command: 'Miss' });
    }
    if (count > 1) {
      throw new InternalServerError('Server error');
    }

    const [ship] = await shipsCursor.toArray();
    const square = ship.squares.find((square) => {
      return square.x === x && square.y === y;
    });

    if (square.hitted) {
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
      throw new InternalServerError(err);
    }
  }
}
