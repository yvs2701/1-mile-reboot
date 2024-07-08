import { useEffect, useRef } from 'react';
import { TMessage } from '../../types'
import styles from './messagePanel.module.css'

export default function MessagePanel({ user, messages }: { user: string, messages: TMessage[] }) {
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /** NOTE - scroll to bottom to show new messages only if the user is near to the bottom of the chat
      * OR the new message has less than 3/4th the height of the container
      */
    if (scrollContainer.current !== null) {
      // find the height of the content that is overflown from the bottom
      const contentAtBottom = scrollContainer.current.scrollHeight - scrollContainer.current.scrollTop - scrollContainer.current.clientHeight

      if (contentAtBottom <= scrollContainer.current.clientHeight * 0.75) {
        // if that content is less than half the height of the container, scroll to the bottom
        scrollContainer.current.scrollTop += contentAtBottom
      }
    }
  }, [messages]);

  return (
    <div className={styles["message-screen"]} ref={scrollContainer}>
      <div className={styles["scrollable"]}>
        {
          messages.map((mssg, index) => {
            return (
              <div key={index} className={`${styles["mssg"]} ${(mssg.userID === user) ? styles["mssg-right"] : styles["mssg-left"]}`}>
                {mssg.message}
              </div>
            )
          })
        }
      </div>
    </div>
  )
}