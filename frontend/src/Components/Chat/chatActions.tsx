import styles from './chatActions.module.css'
import { Primary, Secondary } from '../Buttons/button.tsx'
import { Dispatch, KeyboardEventHandler, MouseEventHandler, SetStateAction } from 'react'

type TProps = {
  disabled?: boolean,
  messageInput: string,
  setMessageInput: Dispatch<SetStateAction<string>>,
  handleNextClick: MouseEventHandler,
  handleSubmitClick: MouseEventHandler,
  keyShortcuts?:KeyboardEventHandler,
}

export default function ChatActions({ disabled, messageInput, setMessageInput, handleNextClick, handleSubmitClick, keyShortcuts }: TProps) {
  return (
    <div className={styles.chatActions}>
      <Secondary label="Next" shortcut="(Esc)" handleClick={handleNextClick} />
      <textarea value={messageInput}
        className={styles.chatbar}
        placeholder="Write a message..."
        onKeyDown={keyShortcuts}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageInput(e.target.value)}
        disabled={disabled}
      />
      <Primary label="Send" shortcut="(ctrl + Enter)" handleClick={handleSubmitClick} disabled={disabled} />
    </div>
  )
}