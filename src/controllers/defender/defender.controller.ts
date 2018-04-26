import { BodyParams, Controller, MergeParams, PathParams, Post, Required } from 'ts-express-decorators';
import { Returns } from 'ts-express-decorators/lib/swagger';
import { BadRequest, NotFound } from 'ts-httpexceptions';
import { $log } from 'ts-log-debug';
import { ISquareDocument } from '../../models/Ship';
import { BoardService } from '../../services/Board.service';
import { ShipService } from '../../services/Ship.service';
import { DefenderResponse } from '../../type/DefenderResponse';
import { BoardController } from '../board/board.controller';

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

    // const ship = new this.shipService.Instance({});

    // Generate holding square of new ship
    const squares: ISquareDocument[] = new Array(size[type]).fill(0).map((_, index) => ({
      x: x + directionVector[direction].x * index,
      y: y + directionVector[direction].y * index,
    }));

    // Boarder check
    const boarderChecked = squares.every(({ x, y }) => {
      return 0 <= x && x < boardSize && 0 <= y && y < boardSize;
    });
    if (!boarderChecked) {
      // TODO: Info
      throw new BadRequest('Your ship is place on boarder.');
    }

    // Check is there is a adjacent ship in board, throw Error
    // Create an adjacent square list
    // FIXME: any
    let adjacentSquare: any = squares
      .concat(squares.map(({ x, y }) => ({ x: x + 1, y })))
      .concat(squares.map(({ x, y }) => ({ x: x - 1, y })))
      .concat(squares.map(({ x, y }) => ({ x, y: y - 1 })))
      .concat(squares.map(({ x, y }) => ({ x, y: y + 1 })));
    const s = new Set();
    adjacentSquare = adjacentSquare.filter(({ x , y }) => {
      if (!s.has(`${x}:${y}`)) {
        s.add(`${x}:${y}`);
        return true;
      }
      return false;
    });

    console.log(adjacentSquare);

    const adjacentShip = this.shipService.ship.find({
      board: boardId,
      squares: {
        $in: adjacentSquare,
      },
    });
    const countAdjacentShip = await adjacentShip.count();
    console.log(adjacentShip);

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
      const [board_, ship] = await Promise.all([
        board.save(),
        this.shipService.ship.insert({
          board: boardId,
          type,
          squares,
        }),
      ]);

      if (countRemainingShip === 0) {
        return new DefenderResponse('StateChange', board_, ship);
      }
      return new DefenderResponse('None', board_, ship);
    } catch (err) {
      throw new Error('');
    }
  }
}
