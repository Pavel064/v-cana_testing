import { useEffect, useRef } from 'react'

function DropdownMenu({ menuItems, classNames, isOpenMenu, setIsOpenMenu }) {
  const menuRef = useRef(null)
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpenMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setIsOpenMenu])
  return (
    <div
      className={`${classNames.container.className} top-14 ${
        !isOpenMenu ? 'hidden' : ''
      }`}
      ref={menuRef}
    >
      {menuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          className={classNames.item.className + ' ' + menuItem.className}
          onClick={() => {
            menuItem.action()
            setIsOpenMenu(false)
          }}
        >
          {menuItem.buttonContent}
        </div>
      ))}
    </div>
  )
}
export default DropdownMenu
