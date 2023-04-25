export interface httpError {
  message: string,
  details: string,
  code: string,
  status: number
}

export interface httpErrors {
  [key: string]: httpError
}

export interface User {
  id?: string;
  email: string;
  password: string;
}

export enum Recipients {
  whatsapp = 'whatsapp',
  email = 'email',
  telegram = 'telegram',
  discord = 'discord',
}

export interface Schedule {
  type: "daily" | "weekly" | "monthly",
  time: string,
  dayOfWeek?: number,
  dayOfMonth?: number
}

interface Query {
  syntax: string,
  vars: Array<string>
}

interface Receiver {
  identity: Recipients,
  address: string,
} 

export enum FlowState {
  RUNNING = "running",
  STOPPED = "stopped",
  FAILED = "failed"
}

export interface Flow {
  id: string;
  userid: string;
  status: FlowState
  query: Query;
  createdAt: number,
  schedule: Schedule,
  receiver: Receiver,
}
