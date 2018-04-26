import { Service } from 'ts-express-decorators';
import { database } from '../models';

@Service()
export class BoardService {
  constructor() {
    this.board = database.Board;
  }

  public board;
}
