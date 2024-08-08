'use client';
import styles from './chatpanel.module.css'
import { SkipBtnStates, TMessage } from '../../utils/types'
import MessagePanel from './MessagePanel'
import ChatActions from './chatActions'
import { Dispatch, KeyboardEventHandler, MouseEventHandler, SetStateAction } from 'react'

type TProps = {
  user: string,
  messageInput: string,
  setMessageInput: Dispatch<SetStateAction<string>>,
  handleNextClick: MouseEventHandler,
  handleSubmitClick: MouseEventHandler,
  keyShortcuts?: KeyboardEventHandler,
  messages: TMessage[],
  disableChat?: boolean,
  skipBtnState: SkipBtnStates,
}

export default function ChatPanelLayout({ user, messages, messageInput, setMessageInput,
  handleNextClick, handleSubmitClick, keyShortcuts, skipBtnState, disableChat }: TProps) {
  return (
    <div className={styles["panel-wrapper"]}>
      <MessagePanel user={user} messages={messages} />
      <ChatActions disableChat={disableChat} skipBtnState={skipBtnState}
        messageInput={messageInput} setMessageInput={setMessageInput}
        handleNextClick={handleNextClick} handleSubmitClick={handleSubmitClick} keyShortcuts={keyShortcuts} />
    </div>
  )
}
