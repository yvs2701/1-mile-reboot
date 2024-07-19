import styles from './chatActions.module.css'
import { Primary, Secondary } from '../Buttons/button.tsx'
import { Dispatch, KeyboardEventHandler, MouseEventHandler, SetStateAction, useState } from 'react'
import { SkipBtnStates } from '../../types.ts'
import EmojiPicker, { EmojiClickData, EmojiStyle, SuggestionMode, Theme } from 'emoji-picker-react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import add_emoji from '../../assets/add_emoji_icon.svg'

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

  const [eprOpen, setEprOpen] = useState(false);

  const handleEmojiClick = (emoji: EmojiClickData) => {
    if (disableChat === true) return
    setMessageInput(prev => prev + emoji.emoji)
  }

  const toggleEmojiPicker = (open?: boolean) => {
    if (disableChat === true) return
    if (open === undefined)
      setEprOpen(prev => !prev)
    open === true ? setEprOpen(true) : setEprOpen(false)
  }

  return (
    <>
      <div className={styles.chatActions}>
        <Secondary label={skipBtnState === SkipBtnStates.NEXT ? 'Next' : skipBtnState === SkipBtnStates.SURE ? 'Sure?' : 'Wait'}
          shortcut="(Esc)" tabIndex={skipBtnState === SkipBtnStates.WAIT ? -1 : 3}
          handleClick={handleNextClick} disabled={skipBtnState === SkipBtnStates.WAIT}
        />

        <span className={styles.chatbar}>
          <textarea value={messageInput}
            placeholder="Write a message..."
            onKeyDown={keyShortcuts}
            onChange={(e) => setMessageInput(e.target.value)}
            disabled={disableChat}
            tabIndex={disableChat === true ? -1 : 1}
            autoFocus={true}
          />

          <span tabIndex={disableChat ? -1 : 1} className={`${styles.emojiBtn} ${disableChat === true ? styles.emojiBtnDisabled : ''}`}
            onFocus={() => toggleEmojiPicker(true)} onBlur={() => toggleEmojiPicker(false)}
          >
            <LazyLoadImage src={add_emoji} alt="Add Emoji" width={32} height={32} />
            <EmojiPicker className={styles.EmojiPicker} onEmojiClick={handleEmojiClick}
              open={eprOpen && (disableChat === false || disableChat === undefined)}
              autoFocusSearch={true} previewConfig={{ showPreview: false }} suggestedEmojisMode={SuggestionMode.RECENT}
              theme={Theme.AUTO} skinTonesDisabled={true} emojiStyle={EmojiStyle.NATIVE} />
          </span>
        </span>

        <Primary label="Send" shortcut="(ctrl + Enter)" handleClick={handleSubmitClick} disabled={disableChat} tabIndex={disableChat === true ? -1 : 2} />
      </div>
    </>
  )
}