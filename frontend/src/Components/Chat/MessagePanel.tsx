import styles from './messagePanel.module.css'

type TMessage = {
  userID: string
  message: string | undefined
}

export default function MessagePanel({ user, messages }: { user: string, messages: TMessage[] }) {

  return (
    <div className={styles["message-screen"]}>
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