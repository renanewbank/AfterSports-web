import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  title?: string
  onClose: () => void
  children: ReactNode
}

const Modal = ({ title, onClose, children }: ModalProps) => {
  // Avoid scrolling the page while the modal is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          {title && <h3>{title}</h3>}
          <button className="ghost-btn modal-close" onClick={onClose} aria-label="Fechar modal">
            X
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal
