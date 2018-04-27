import { Model } from 'iridium';
import { Service } from 'ts-express-decorators';
import { database } from '../models';
import { Board, IBoardDocument } from '../models/Board';

@Service()
export class BoardService {
  constructor() {
    this.board = database.Board;
  }

  public board: Model<IBoardDocument, Board>;
}
