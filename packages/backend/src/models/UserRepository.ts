import { MongoClient } from 'mongodb';
import { User, Flow } from '../types';
import { ATLAS } from '../common/const';

export default class UserRepo {
  client: MongoClient;
  flows: any;
  users: any;
  keys: any;
  db: any;

  constructor() {
    this.client = new MongoClient(
      `mongodb+srv://${ATLAS.USER}:${ATLAS.PASSWORD}@propelr-dev.bvw8txe.mongodb.net/?retryWrites=true&w=majority`,
    );
    this.db = null;
    this.flows = null;
    this.users = null;
    this.keys = null;
  }

  async init() {
    try {
      await this.client.connect();
      this.db = this.client.db('UserDB');
      this.flows = this.db.collection('flows');
      this.users = this.db.collection('users');
      this.keys = this.db.collection('keys');
    } catch (err) {
      console.error(err);
    }
  }

  async pushUser(user: User): Promise<User | null> {
    try {
      await this.users.insertOne(user);
      return user;
    } catch (err) {
      return null;
    }
  }
  async deleteUserByEmail(email: string): Promise<boolean | null> {
    try {
      await this.users.deleteOne({ email, })
      return true;
    } catch (err) {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.users.findOne({ email, })
      return user;
    } catch (err) {
      return null;
    }
  }

  async getUsers(): Promise<Array<User> | null> {
    try {
      const user = await this.users.find({}).toArray();
      return user;
    } catch (err) {
      return null;
    }
  }

  async updateFlowFieldById(id: string, obj: any): Promise<string | null> {
    try {
      let result = await this.flows.updateOne({
        id,
      }, {
        $set: obj
      })
      if (result.ok) return id;
      return null;
    } catch {
      return null;
    }
  }

  async pushFlow(flow: Flow): Promise<Flow | null> {
    try {
      const flw = await this.flows.insertOne(flow);
      return flw;
    } catch (err) {
      return null;
    }
  }

  async flowExists(flowid: string): Promise<boolean> {
    const flw = await this.flows.findOne({ id: flowid });
    if (flw) return true;
    return false;
  }

  async getFlowById(flowid: string): Promise<Flow | null>  {
    try {
      const flw = await this.flows.findOne({ id: flowid });
      return flw;
    } catch (err) {
      return null;
    }
  }

  async deleteFlowById(flowid: string): Promise<any | null> {
    try {
      const deleted = await this.flows.deleteOne({ id: flowid })
      if (deleted.deletedCount === 0) {
        return null;
      } 
      return { 
        id: flowid
      };
    } catch (err) {
      return null;
    }
  }

  async deleteFlowByUserId(userId: string): Promise<boolean | null> {
    try {
      await this.users.deleteOne({ userid: userId })
      return true;
    } catch (err) {
      return null;
    }
  }

  async RAW_getFlows(query: any) {
    const flows = await this.flows.find(query).toArray();
    return flows;
  }

  async getFlowsByUserId(userId: string): Promise<Array<Flow> | null> {
    try {
      const flows = await this.flows.find({ userid: userId }).toArray();
      return flows;
    } catch (err) {
      return null;
    }
  }

  async close() {
    await this.client.close();
  }
}

export const USER_DB = new UserRepo();
