import Loading from 'public/progress.svg'

function ButtonSave({ children, onClick, isSaving, disabled }) {
  return (
    <button
      className="relative btn-secondary w-fit disabled:opacity-25 disabled:cursor-default"
      onClick={onClick}
      disabled={isSaving || disabled}
    >
      <span className={`${isSaving ? 'opacity-0' : 'opacity-100'}`}>{children}</span>
      {isSaving && (
        <Loading className="absolute mx-auto my-auto inset-0 w-6 animate-spin" />
      )}
    </button>
  )
}

export default ButtonSave
