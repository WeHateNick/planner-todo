import { useState } from 'react'
import { MONTHS } from '../../utils'
import './TodoModal.scss'

function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  return `${weekday}, ${MONTHS[month - 1]} ${day}, ${year}`
}

export default function TodoModal({ date, todo, onSave, onClose }) {
  const [title, setTitle] = useState(todo?.title || '')
  const [selectedDate, setSelectedDate] = useState(date || todo?.date || '')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || !selectedDate) return
    onSave({ id: todo?.id || null, date: selectedDate, title: trimmed })
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleKey(e) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop} onKeyDown={handleKey} tabIndex={-1}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">{todo ? 'Edit Todo' : 'New Todo'}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label className="modal__label">Title</label>
            <input
              autoFocus
              className="modal__input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={120}
            />
          </div>

          <div className="modal__field">
            <label className="modal__label">Date</label>
            <input
              className="modal__input"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <span className="modal__date-preview">{formatDisplayDate(selectedDate)}</span>
            )}
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="modal__btn modal__btn--primary"
              disabled={!title.trim() || !selectedDate}
            >
              {todo ? 'Save Changes' : 'Add Todo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
