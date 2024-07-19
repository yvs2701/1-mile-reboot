import styles from './button.module.css'

const Button = ({ classes, label, shortcut, handleClick, disabled, tabIndex }:
  { classes: string, label: String, shortcut?: String, handleClick: (...args: any) => any, disabled?: boolean, tabIndex?: number }
) => {
  return (
    <button
      className={classes}
      onClick={handleClick}
      data-shortcut={shortcut}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      {label}
    </button>
  )
}

export const Primary = ({ label, shortcut, handleClick, disabled, tabIndex }:
  { disabled?: boolean, label: String, shortcut?: String, tabIndex?: number, handleClick: (...args: any) => any }) => {
  return (
    <Button classes={`${styles.btn} ${styles["btn-primary"]}`} disabled={disabled}
      tabIndex={tabIndex} label={label} shortcut={shortcut} handleClick={handleClick} />
  )
}

export const Secondary = ({ label, shortcut, handleClick, disabled, tabIndex }:
  { disabled?: boolean, label: String, shortcut?: String, tabIndex?: number, handleClick: (...args: any) => any }) => {
  return (
    <Button classes={`${styles.btn} ${styles["btn-secondary"]}`} disabled={disabled}
      tabIndex={tabIndex} label={label} shortcut={shortcut} handleClick={handleClick} />
  )
}
