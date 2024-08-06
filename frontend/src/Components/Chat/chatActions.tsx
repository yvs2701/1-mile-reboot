"use client";
import styles from './chatActions.module.css'
import { Primary, Secondary } from '../Buttons/button.tsx'
import { Dispatch, KeyboardEventHandler, MouseEventHandler, SetStateAction, useEffect, useRef, useState } from 'react'
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
  const eprBtnRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEmojiClick = (emoji: EmojiClickData) => {
    if (disableChat === true) return;
    setMessageInput(prev => prev + emoji.emoji);
  }

  useEffect(() => {
    if (!disableChat)
      textareaRef.current?.focus();
  }, [disableChat]);

  useEffect(() => {
    if (!disableChat && eprOpen === false) {
      // Emoji picker is closed check for focus events on it
      const handleFocusEvent = (e: globalThis.FocusEvent) => {
        if (eprBtnRef.current !== null && eprBtnRef.current?.contains(e.target as Node))
          setEprOpen(true);
      }

      eprBtnRef.current?.addEventListener('focusin', handleFocusEvent);
      return () => eprBtnRef.current?.removeEventListener('focusin', handleFocusEvent);
    } else if (!disableChat) {
      // Emoji picker is open close emoji picker when focus-within is lost from its container or esc key is pressed
      const handleBlurEvent = (e: globalThis.FocusEvent) => {
        if (e.relatedTarget === null || eprBtnRef.current !== null && !eprBtnRef.current.contains(e.relatedTarget as Node))
          setEprOpen(false);
      }

      const keyDownEvent = (e: globalThis.KeyboardEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.key === 'Escape') {
          setEprOpen(false);
          textareaRef.current?.focus();
        }
      }

      eprBtnRef.current?.addEventListener('focusout', handleBlurEvent);
      eprBtnRef.current?.addEventListener('keydown', keyDownEvent);
      return () => {
        eprBtnRef.current?.removeEventListener('focusout', handleBlurEvent);
        eprBtnRef.current?.removeEventListener('keydown', keyDownEvent);
      }
    }
  }, [eprOpen, disableChat]);

  return (
    <>
      <div className={styles.chatActions}>
        <Secondary label={skipBtnState === SkipBtnStates.NEXT ? 'Next' : skipBtnState === SkipBtnStates.SURE ? 'Sure?' : 'Wait'}
          shortcut="(Esc)" tabIndex={skipBtnState === SkipBtnStates.WAIT ? -1 : 3}
          handleClick={handleNextClick} disabled={skipBtnState === SkipBtnStates.WAIT}
        />

        <span className={styles.chatbar}>
          <textarea className='thin-hidden-scrollbar'
            value={messageInput}
            placeholder="Write a message..."
            onKeyDown={keyShortcuts}
            onChange={(e) => setMessageInput(e.target.value)}
            disabled={disableChat}
            tabIndex={disableChat === true ? -1 : 1}
            ref={textareaRef}
          />

          <span tabIndex={disableChat ? -1 : 1} className={`${styles.emojiBtn} ${disableChat ? styles.emojiBtnDisabled : ''}`} ref={eprBtnRef}>
            <LazyLoadImage src={add_emoji} alt="Add Emoji" width={32} height={32} />
            <EmojiPicker className={styles.EmojiPicker} onEmojiClick={handleEmojiClick}
              open={eprOpen && (disableChat === false || disableChat === undefined)}
              autoFocusSearch={false} previewConfig={{ showPreview: false }} suggestedEmojisMode={SuggestionMode.RECENT}
              theme={Theme.AUTO} skinTonesDisabled={true} emojiStyle={EmojiStyle.NATIVE} />
          </span>
        </span>

        <Primary label="Send" shortcut="(ctrl + Enter)"
          handleClick={(e) => {
            handleSubmitClick(e);
            textareaRef.current?.focus();
          }}
          disabled={disableChat} tabIndex={disableChat === true ? -1 : 2}
        />
      </div>
    </>
  )
}