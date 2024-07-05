import styles from './chatActions.module.css'
import { Primary, Secondary } from '../Buttons/button.tsx'
import { Dispatch, SetStateAction } from 'react'

type TProps = {
  disabled: boolean,
  messageInput: string,
  setMessageInput: Dispatch<SetStateAction<string>>,
  handleNextClick: (e: React.MouseEvent<HTMLElement>) => Promise<void>,
  handleSubmitClick: (e: React.MouseEvent<HTMLElement>) => Promise<void>,
}

export default function ChatActions({ disabled, messageInput, setMessageInput, handleNextClick, handleSubmitClick }: TProps) {
  return (
    <div className={styles.chatActions}>
      <Secondary label="Next" subtitle="(Esc)" handleClick={handleNextClick} />
      <textarea value={messageInput}
        className={styles.chatbar}
        placeholder="Write a message..."
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageInput(e.target.value)}
        disabled={disabled}
      />
      <Primary label="Send" subtitle="(ctrl + Enter)" handleClick={handleSubmitClick} disabled={disabled} />
    </div>
  )
}