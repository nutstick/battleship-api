import { Core, Model } from 'iridium';
import { Service } from 'ts-express-decorators';
import { database } from '../models';

@Service()
export class MongoDBService {
  static async connect(): Promise<Core> {
    await database.connect();

    return database;
  }
}
