import styles from './button.module.css'

const Button = ({ classes, label, shortcut, handleClick, disabled }:
  { classes: string, label: String, shortcut?: String, handleClick: (...args: any) => any, disabled?: boolean }
) => {
  return (
    <button
      className={classes}
      onClick={handleClick}
      data-shortcut={shortcut}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

export const Primary = ({ label, shortcut, handleClick, disabled }:
  { disabled?: boolean, label: String, shortcut?: String, handleClick: (...args: any) => any }) => {
  return (
    <Button classes={`${styles.btn} ${styles["btn-primary"]}`} disabled={disabled}
      label={label} shortcut={shortcut} handleClick={handleClick} />
  )
}

export const Secondary = ({ label, shortcut, handleClick, disabled }:
  { disabled?: boolean, label: String, shortcut?: String, handleClick: (...args: any) => any }) => {
  return (
    <Button classes={`${styles.btn} ${styles["btn-secondary"]}`} disabled={disabled}
      label={label} shortcut={shortcut} handleClick={handleClick} />
  )
}
