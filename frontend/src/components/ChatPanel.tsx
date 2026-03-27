import { useMemo, useState } from "react";
import type { ChatMessage, ChatRoom } from "../types/api";

type Props = {
  isBusy: boolean;
  rooms: ChatRoom[];
  messagesByRoom: Record<number, ChatMessage[]>;
  onCreateRoom: (input: { topic: string; participant_user_ids: number[] }) => Promise<void>;
  onLoadMessages: (roomId: number) => Promise<void>;
  onSendMessage: (input: { room_id: number; content: string }) => Promise<void>;
};

function scoreClass(score: number) {
  if (score >= 0.8) return "chip danger";
  if (score >= 0.45) return "chip warn";
  return "chip ok";
}

export function ChatPanel({
  isBusy,
  rooms,
  messagesByRoom,
  onCreateRoom,
  onLoadMessages,
  onSendMessage,
}: Props) {
  const [topic, setTopic] = useState("Product sourcing negotiation");
  const [participantUserId, setParticipantUserId] = useState("1");
  const [roomId, setRoomId] = useState("");
  const [content, setContent] = useState("");
  const selectedRoomId = Number(roomId);
  const roomMessages = useMemo(
    () => (selectedRoomId ? messagesByRoom[selectedRoomId] ?? [] : []),
    [messagesByRoom, selectedRoomId],
  );

  return (
    <section className="panel">
      <h2>Chat + AI Fraud Monitoring</h2>
      <p className="panel-subtitle">
        Open business chats, exchange messages, and view moderation risk scoring.
      </p>

      <div className="grid two">
        <label>
          Room topic
          <input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </label>
        <label>
          Participant user ID
          <input
            value={participantUserId}
            onChange={(e) => setParticipantUserId(e.target.value)}
            placeholder="e.g. 2"
          />
        </label>
      </div>

      <div className="actions">
        <button
          onClick={() => onCreateRoom({ topic, participant_user_ids: [Number(participantUserId)] })}
          disabled={isBusy || !topic.trim() || !participantUserId.trim() || Number(participantUserId) <= 0}
        >
          Create room
        </button>
      </div>

      <div className="table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>Room ID</th>
              <th>Topic</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.topic}</td>
                <td>{new Date(room.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!rooms.length && (
              <tr>
                <td colSpan={3} className="empty-row">
                  No rooms created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid two">
        <label>
          Room ID
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="e.g. 1" />
        </label>
        <label>
          Message
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Discuss pricing, quantity, and shipping terms"
          />
        </label>
      </div>

      <div className="actions">
        <button
          onClick={() => onLoadMessages(selectedRoomId)}
          disabled={isBusy || !roomId.trim() || selectedRoomId <= 0}
        >
          Load messages
        </button>
        <button
          className="secondary"
          onClick={() => onSendMessage({ room_id: selectedRoomId, content })}
          disabled={isBusy || !roomId.trim() || !content.trim() || selectedRoomId <= 0}
        >
          Send message
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Sender</th>
              <th>Message</th>
              <th>Moderation</th>
            </tr>
          </thead>
          <tbody>
            {roomMessages.map((message) => (
              <tr key={message.id}>
                <td>{message.id}</td>
                <td>{message.sender_id}</td>
                <td>{message.content}</td>
                <td>
                  <span className={scoreClass(message.moderation_score)}>
                    {(message.moderation_score * 100).toFixed(0)}%
                  </span>
                  {message.is_blocked ? " blocked" : " allowed"}
                  {message.moderation_reason ? ` (${message.moderation_reason})` : ""}
                </td>
              </tr>
            ))}
            {!roomMessages.length && (
              <tr>
                <td colSpan={4} className="empty-row">
                  No messages loaded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
