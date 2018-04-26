import { BodyParams, Controller, MergeParams, PathParams, Post, Required } from 'ts-express-decorators';
import { Returns } from 'ts-express-decorators/lib/swagger';
import { BadRequest, NotFound } from 'ts-httpexceptions';
import { $log } from 'ts-log-debug';
import { ISquareDocument } from '../../models/Ship';
import { BoardService } from '../../services/Board.service';
import { ShipService } from '../../services/Ship.service';
import { DefenderResponse } from '../../type/DefenderResponse';
import { BoardController } from '../board/board.controller';

const boardSize = 10;

@Controller('/:boardId/defender')
@MergeParams()
export class DefenderController {
  constructor(
    private boardService: BoardService,
    private shipService: ShipService,
  ) {
  }

  @Post('/place')
  @Returns(DefenderResponse)
  async attack(
    @Required() @PathParams('boardId') boardId: string,
    @Required() @BodyParams('type') type: string,
    @Required() @BodyParams('x') x: number,
    @Required() @BodyParams('y') y: number,
    @Required() @BodyParams('direction') direction: string,
  ): Promise<DefenderResponse> {
    const board = await this.boardService.board.findOne(boardId);

    $log.info(board.state);
    if (!board) {
      throw new NotFound('Board not found');
    }
    // TODO: Enum state
    if (board.state !== 'Start') {
      throw new BadRequest('Start state has done.');
    }

    // Check ship type is avaliable
    if (board.avaliable[type] <= 0) {
      throw new BadRequest(`No more ${type} can be place.`);
    }

    board.avaliable[type]--;

    const ship = this.shipService.createShip(boardId, type, x, y, direction);

    // Boarder check
    const boarderChecked = ship.squares.every(({ x, y }) => {
      return 0 <= x && x < boardSize && 0 <= y && y < boardSize;
    });
    if (!boarderChecked) {
      // TODO: Info
      throw new BadRequest('Your ship is place on boarder.');
    }

    // Check is there is a adjacent ship in board, throw Error
    // Create an adjacent square list
    // FIXME: any
    let adjacentSquare: any = ship.squares
      .concat(ship.squares.map(({ x, y }) => ({ x: x + 1, y })))
      .concat(ship.squares.map(({ x, y }) => ({ x: x - 1, y })))
      .concat(ship.squares.map(({ x, y }) => ({ x, y: y - 1 })))
      .concat(ship.squares.map(({ x, y }) => ({ x, y: y + 1 })));
    const s = new Set();
    adjacentSquare = adjacentSquare.filter(({ x , y }) => {
      if (!s.has(`${x}:${y}`)) {
        s.add(`${x}:${y}`);
        return true;
      }
      return false;
    });

    const adjacentShip = this.shipService.ship.find({
      board: boardId,
      squares: {
        $in: adjacentSquare,
      },
    });
    const countAdjacentShip = await adjacentShip.count();

    if (countAdjacentShip) {
      // TODO: Error
      throw new BadRequest('Illegal to place ship adjacent with others.');
    }

    // Check state changing
    const countRemainingShip = Object.keys(board.avaliable)
      .reduce((sum, key) => sum + board.avaliable[key], 0);

    if (countRemainingShip === 0) {
      board.state = 'attacking';
    }

    // Legal to place ship update the board data and add ship to db
    try {
      // TODO: Concerency
      const [board_, ship_] = await Promise.all([
        board.save(),
        ship.save(),
      ]);

      if (countRemainingShip === 0) {
        return new DefenderResponse('StateChange', board_, ship_);
      }
      return new DefenderResponse('None', board_, ship_);
    } catch (err) {
      throw new Error('');
    }
  }
}
