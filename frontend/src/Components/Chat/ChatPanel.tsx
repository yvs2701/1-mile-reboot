'use client';
import styles from './chatpanel.module.css'
import { TMessage } from '../../types'
import MessagePanel from './MessagePanel'
import ChatActions from './chatActions'
import { Dispatch, SetStateAction } from 'react'

type TProps = {
  user: string,
  messageInput: string,
  setMessageInput: Dispatch<SetStateAction<string>>,
  handleNextClick: (e: React.MouseEvent<HTMLElement>) => Promise<void>,
  handleSubmitClick: (e: React.MouseEvent<HTMLElement>) => Promise<void>,
  messages: TMessage[],
  disabled: boolean,
}

export default function ChatPanelLayout({ user, messages, messageInput, setMessageInput, handleNextClick, handleSubmitClick, disabled }: TProps) {
  return (
    <div className={styles["panel-wrapper"]}>
      <MessagePanel user={user} messages={messages} />
      <ChatActions disabled={disabled}
        messageInput={messageInput} setMessageInput={setMessageInput}
        handleNextClick={handleNextClick} handleSubmitClick={handleSubmitClick} />
    </div>
  )
}
