/**
 * Simulation-control payloads (facilitator/admin) and socket events.
 *
 * Source: api/controllers/simulation/init.ts and api/utils/socketio.ts.
 * See docs/API_CONTRACT.md §3 and §5.5.
 */

import { MessageResponse } from './common';

/** POST /stratege/api/admin/seminar/:seminar_id/init  -> MessageResponse */
export type InitResponse = MessageResponse;

/** POST /stratege/api/admin/seminar/:seminar_id/runsimulation */
export interface RunSimulationRequest {
  /** advance to a new period when true; otherwise re-run current period */
  goingToNewPeriod: boolean;
  /** one flag per company: overwrite that company's saved decision with defaults */
  decisionsOverwriteSwitchers: boolean[];
}

export type RunSimulationResponse = MessageResponse;

/* ------------------------------------------------------------------ */
/* Socket.io contract                                                  */
/* ------------------------------------------------------------------ */

/** Query params sent on the socket connection handshake. */
export interface SocketHandshakeQuery {
  /** JWT (required) */
  token: string;
  /** required for facilitators to join their seminar room */
  seminarId?: string;
}

/** Server -> client event names. */
export const SERVER_EVENTS = {
  decisionUpdate: 'marksimosDecisionUpdate',
  chatSeminar: 'marksimosChatMessageSeminarUpdate',
  chatCompany: 'marksimosChatMessageCompanyUpdate',
} as const;

export interface ChatBroadcast {
  user: { username: string; avatar?: string };
  message: string;
}

/** Payload of `marksimosDecisionUpdate` (the updated decision). */
export type DecisionUpdateBroadcast = unknown;

/**
 * Typed map of server -> client socket events. NB: chat is sent over REST
 * (POST /stratege/api/seminar/chat/*) and only the broadcast comes back over
 * the socket — there are no functional client -> server events.
 */
export interface ServerToClientEvents {
  marksimosDecisionUpdate: (data: DecisionUpdateBroadcast) => void;
  marksimosChatMessageSeminarUpdate: (data: ChatBroadcast) => void;
  marksimosChatMessageCompanyUpdate: (data: ChatBroadcast) => void;
}
