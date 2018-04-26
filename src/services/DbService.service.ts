import { Service } from 'ts-express-decorators';
import { database } from '../models';

@Service()
export class DbService {
  constructor() {
    this.db = database;
  }
  public db = database;
}
