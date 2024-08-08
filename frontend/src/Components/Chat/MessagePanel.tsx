import { useEffect, useRef } from 'react';
import { message_server_id, TMessage } from '../../utils/types'
import styles from './messagePanel.module.css'

export default function MessagePanel({ user, messages }: { user: string, messages: TMessage[] }) {
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /** NOTE - scroll to bottom to show new messages only if the user is near to the bottom of the chat
      * OR the new message was sent by the user
      */
    if (scrollContainer.current !== null && messages.length > 0) {
      // if the last message was sent by the user, scroll to the bottom
      if (messages[messages.length - 1].userID === user || messages[messages.length - 1].userID === message_server_id) {
        scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight
      } else {
        // find the height of the content that is overflown from the bottom
        const contentAtBottom = scrollContainer.current.scrollHeight - scrollContainer.current.scrollTop - scrollContainer.current.clientHeight

        if (contentAtBottom <= scrollContainer.current.clientHeight * 0.60) {
          // if that content is less than 60% the height of the container, scroll to the bottom
          scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight
        }
      }
    }
  }, [messages]);

  return (
    <div className={`${styles["message-screen"]} thin-hidden-scrollbar`} ref={scrollContainer}>
      <div className={styles["scrollable"]}>
        {
          messages.map((mssg, index) => {
            return (
              <div key={index} className={
                `${styles["mssg"]} ${mssg.userID === message_server_id ? styles["mssg-center"] : mssg.userID === user ? styles["mssg-right"] : styles["mssg-left"]}`
              }>
                {mssg.message}
              </div>
            )
          })
        }
      </div>
    </div>
  )
}