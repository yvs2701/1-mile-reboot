import { useCallback, useEffect, useRef, useState } from "react";
import ChatPanel from "../Components/Chat/ChatPanel";
import { TMessage, SocketEvents, message_server_id, SkipBtnStates, ServerMessages } from "../types";
import { Socket } from "socket.io-client";
import styles from './chat.module.css';

function ChatPage({ socket }: { socket: Socket }) {
  // TODO: connect peers withing a given distance

  const [userID, setUserID] = useState<string>('');
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [room, setRoom] = useState<string | null>(null);
  const [skipBtn, setSkipBtn] = useState<SkipBtnStates>(SkipBtnStates.NEXT);
  const skipBtnLastClick = useRef<number>(0);
  const submitBtnLastClick = useRef<number>(0);

  const handleNextClick = useCallback(() => {
    if (!socket.connected || userID === '')
      return;

    const now = new Date().getTime();
    if (now - skipBtnLastClick.current < 1500) {
      // throttled fn - can only run after 1.5s after the last state change
      return;
    }

    function skipChat() {
      socket.emit(SocketEvents.SKIP_CHAT, { room })
      skipBtnLastClick.current = now

      const server_mssg: TMessage = { userID: message_server_id, message: 'Finding Strangers...', room: room! }
      setMessages(prev => [...prev, server_mssg])
      setSkipBtn(SkipBtnStates.WAIT)
    }

    switch (skipBtn) {
      case SkipBtnStates.NEXT:
        if (room === null) {
          // don't ask for confirmation here
          skipChat()
        } else {
          // ask for confirmation before exiting a room
          setSkipBtn(_ => SkipBtnStates.SURE)
        }
        break;
      case SkipBtnStates.SURE:
        skipChat()
        break;
      default: break;
    }
  }, [userID, room, skipBtn])

  useEffect(() => {
    if (skipBtn === SkipBtnStates.SURE) {
      const timer = setTimeout(() => {
        setSkipBtn(SkipBtnStates.NEXT)
      }, 2000); // if user does't skip in 2 seconds cancel the skip request

      return () => clearTimeout(timer);
    }
  }, [skipBtn])

  const handleSubmitClick = useCallback(() => {
    if (!socket.connected || userID === '' || room === null || messageInput.trim() === '')
      return;

    const now = new Date().getTime();
    if (now - submitBtnLastClick.current < 500) {
      // throttled fn - can only run after 1/2s after the last state change
      return;
    }
    submitBtnLastClick.current = now

    const mssg: TMessage = { userID: socket.id!, message: messageInput.trim(), room: room }
    socket.emit(SocketEvents.CHAT_SEND, mssg)

    setMessages(prev => [...prev, mssg])
    setMessageInput('')
  }, [userID, room, messageInput])

  const keyShortcuts = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleSubmitClick()
    }
    else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      handleNextClick()
    }
    return;
  }, [handleNextClick, handleSubmitClick])

  useEffect(() => {
    window.addEventListener('keydown', keyShortcuts);
    return () => window.removeEventListener('keydown', keyShortcuts);
  }, [keyShortcuts]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onConnect() {
      setUserID(socket.id!);
    }

    function onDisconnect() {
      setRoom(null);
      setMessageInput('');
    }

    function onChatStart(data: { room: string }) {
      setRoom(data.room);
      const server_mssg: TMessage = { userID: message_server_id, message: ServerMessages.NEW_CHAT, room: room! };
      setMessages([server_mssg]);
      setMessageInput('');
      setSkipBtn(SkipBtnStates.NEXT);
    }

    function onNoPeerAvailable() {
      // this socket has already been unsubsrcibed from the room, but we will only update it after finding a new peer
      const server_mssg: TMessage = {
        userID: message_server_id,
        message: ServerMessages.NO_PEER_AVAILABLE,
        room: room!
      };
      setMessages(prev => [...prev, server_mssg]);
    }

    function onChatEnd() {
      const server_mssg: TMessage = { userID: message_server_id, message: ServerMessages.CHAT_ENDED, room: room! };
      setMessages(prev => [...prev, server_mssg]);
      setRoom(null);
    }

    function onChatMessage(data: TMessage) {
      setMessages(prev => [...prev, data]);
    }

    socket
      .on(SocketEvents.CONNECT, onConnect)
      .on(SocketEvents.DISCONNECT, onDisconnect)
      .on(SocketEvents.CHAT_START, onChatStart)
      .on(SocketEvents.CHAT_MESSAGE, onChatMessage)
      .on(SocketEvents.CHAT_END, onChatEnd)
      .on(SocketEvents.NO_PEER_AVAILABLE, onNoPeerAvailable)

    return () => {
      socket.disconnect()
        .off(SocketEvents.CONNECT, onConnect)
        .off(SocketEvents.DISCONNECT, onDisconnect)
        .off(SocketEvents.CHAT_MESSAGE, onChatMessage)
        .off(SocketEvents.CHAT_START, onChatStart)
        .off(SocketEvents.CHAT_END, onChatEnd)
        .off(SocketEvents.NO_PEER_AVAILABLE, onNoPeerAvailable)
    };
  }, []);

  return (
    <section className={styles['chat-section']}>
      {/* Chat will be disabled if the current user skipped (skipBtn = 'WAIT') or the stranger skipped (room = null) */}
      <ChatPanel user={userID} disableChat={room === null || skipBtn === SkipBtnStates.WAIT} skipBtnState={skipBtn}
        messages={messages} messageInput={messageInput} setMessageInput={setMessageInput}
        handleNextClick={handleNextClick} handleSubmitClick={handleSubmitClick}
      />
    </section>
  )
}

export default ChatPage;
