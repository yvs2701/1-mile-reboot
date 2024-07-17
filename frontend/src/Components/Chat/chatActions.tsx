import styles from './chatActions.module.css'
import { Primary, Secondary } from '../Buttons/button.tsx'
import { Dispatch, KeyboardEventHandler, MouseEventHandler, SetStateAction } from 'react'
import { SkipBtnStates } from '../../types.ts'

type TProps = {
  messageInput: string,
  setMessageInput: Dispatch<SetStateAction<string>>,
  handleNextClick: MouseEventHandler,
  handleSubmitClick: MouseEventHandler,
  keyShortcuts?: KeyboardEventHandler,
  disableChat?: boolean,
  skipBtnState: SkipBtnStates,
}

export default function ChatActions({ messageInput, setMessageInput, handleNextClick, handleSubmitClick, keyShortcuts, skipBtnState, disableChat }: TProps) {
  return (
    <div className={styles.chatActions}>
      <Secondary label={skipBtnState === SkipBtnStates.NEXT ? 'Next' : skipBtnState === SkipBtnStates.SURE ? 'Sure?' : 'Wait'}
        shortcut="(Esc)" handleClick={handleNextClick} disabled={skipBtnState === SkipBtnStates.WAIT}
      />
      <textarea value={messageInput}
        className={styles.chatbar}
        placeholder="Write a message..."
        onKeyDown={keyShortcuts}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageInput(e.target.value)}
        disabled={disableChat}
      />
      <Primary label="Send" shortcut="(ctrl + Enter)" handleClick={handleSubmitClick} disabled={disableChat} />
    </div>
  )
}