import { Model } from 'iridium';
import { ModelSpecificInstanceConstructor } from 'iridium/dist/lib/ModelInterfaces';
import { Service } from 'ts-express-decorators';
import { database } from '../models';
import { IShipDocument, Ship } from '../models/Ship';

@Service()
export class ShipService {
  constructor() {
    this.ship = database.Ship;
    this.Instance = database.Ship.Instance;
  }

  public ship: Model<IShipDocument, Ship>;
  public Instance: ModelSpecificInstanceConstructor<IShipDocument, Ship>;
}
