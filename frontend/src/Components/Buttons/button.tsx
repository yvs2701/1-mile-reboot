import styles from './button.module.css'

const Button = ({ classes, label, subtitle, handleClick, disabled }:
  { classes: string, label: String, subtitle?: String, handleClick: (...args: any) => any, disabled?: boolean }
) => {
  return (
    <button
      className={classes}
      onClick={handleClick}
      data-subtitle={subtitle}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

export const Primary = ({ label, subtitle, handleClick, disabled }:
  { disabled?: boolean, label: String, subtitle?: String, handleClick: (...args: any) => any }) => {
  return (
    <Button classes={`${styles.btn} ${styles["btn-primary"]}`} disabled={disabled}
      label={label} subtitle={subtitle} handleClick={handleClick} />
  )
}

export const Secondary = ({ label, subtitle, handleClick, disabled }:
  { disabled?: boolean, label: String, subtitle?: String, handleClick: (...args: any) => any }) => {
  return (
    <Button classes={`${styles.btn} ${styles["btn-secondary"]}`} disabled={disabled}
      label={label} subtitle={subtitle} handleClick={handleClick} />
  )
}
