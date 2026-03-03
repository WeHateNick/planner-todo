import { useState, useEffect, useRef, useMemo } from 'react'
import { MONTHS, todayStr } from '../../utils'
import './TodoList.scss'

const VIEWS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
]

function CheckboxEmptyIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="23" height="23" rx="5" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function parseDateParts(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const weekday = new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short' })
  return { day, weekday }
}

function groupByMonth(todos) {
  const groups = {}
  todos.forEach(todo => {
    const [year, month] = todo.date.split('-').map(Number)
    const key = `${year}-${String(month).padStart(2, '0')}`
    if (!groups[key]) groups[key] = { label: `${MONTHS[month - 1]} ${year}`, todos: [] }
    groups[key].todos.push(todo)
  })
  return Object.values(groups)
}

export default function TodoList({ todos, onAdd, onTodoClick, onTodoToggle, onTodoDelete }) {
  const [view, setView] = useState('upcoming')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastCheckedId, setLastCheckedId] = useState(null)
  const [clearingId, setClearingId] = useState(null)
  const clearingTimer = useRef(null)
  const titleRef = useRef(null)
  const searchInputRef = useRef(null)
  const today = useMemo(() => todayStr(), [])

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e) {
      if (!titleRef.current?.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => () => clearTimeout(clearingTimer.current), [])

  function startClearing(id) {
    clearTimeout(clearingTimer.current)
    setClearingId(id)
    clearingTimer.current = setTimeout(() => setClearingId(null), 400)
  }

  function handleToggle(id) {
    const todo = todos.find(t => t.id === id)
    if (todo && !todo.completed) {
      if (lastCheckedId !== null) startClearing(lastCheckedId)
      setLastCheckedId(id)
    } else {
      if (view === 'completed') startClearing(id)
      if (id === lastCheckedId) setLastCheckedId(null)
    }
    onTodoToggle(id)
  }

  function openSearch() {
    setDropdownOpen(false)
    setSearchOpen(true)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery('')
  }

  const grouped = useMemo(() => {
    if (view === 'upcoming') {
      return groupByMonth(
        todos
          .filter(t => t.date >= today && (!t.completed || t.id === lastCheckedId || t.id === clearingId))
          .sort((a, b) => a.date.localeCompare(b.date))
      )
    }
    return groupByMonth(
      todos.filter(t => t.completed || t.id === clearingId).sort((a, b) => a.date.localeCompare(b.date))
    )
  }, [todos, today, view, lastCheckedId, clearingId])

  const searchGrouped = useMemo(() => {
    if (!searchOpen) return null
    const q = searchQuery.trim().toLowerCase()
    const filtered = q
      ? todos.filter(t => t.title.toLowerCase().includes(q))
      : todos
    return groupByMonth(filtered.slice().sort((a, b) => a.date.localeCompare(b.date)))
  }, [todos, searchOpen, searchQuery])

  const countLabel = useMemo(() => {
    if (view === 'upcoming') {
      const future = todos.filter(t => t.date >= today)
      if (!future.length) return null
      return `${future.filter(t => t.completed).length}/${future.length}`
    }
    const n = todos.filter(t => t.completed).length
    return n > 0 ? String(n) : null
  }, [todos, today, view])

  const currentLabel = VIEWS.find(v => v.value === view).label
  const displayGroups = searchOpen ? searchGrouped : grouped

  return (
    <aside className="todo-list">
      <div className="todo-list__header">
        {searchOpen ? (
          <div className="todo-list__search-bar">
            <span className="todo-list__search-icon"><SearchIcon /></span>
            <input
              ref={searchInputRef}
              className="todo-list__search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search todos…"
            />
            <button className="todo-list__search-close" onClick={closeSearch} aria-label="Close search">
              ×
            </button>
          </div>
        ) : (
          <>
            <div
              ref={titleRef}
              className={['todo-list__title-wrapper', dropdownOpen && 'todo-list__title-wrapper--open'].filter(Boolean).join(' ')}
            >
              <button
                className="todo-list__title-btn"
                onClick={() => setDropdownOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
              >
                <span className="todo-list__title-text">{currentLabel}</span>
                <span className="todo-list__chevron">▾</span>
              </button>

              {dropdownOpen && (
                <ul className="todo-list__dropdown" role="listbox">
                  {VIEWS.map(v => (
                    <li
                      key={v.value}
                      role="option"
                      aria-selected={v.value === view}
                      className={['todo-list__dropdown-item', v.value === view && 'todo-list__dropdown-item--active'].filter(Boolean).join(' ')}
                      onClick={() => {
                    if (view === 'upcoming' && v.value !== 'upcoming') setLastCheckedId(null)
                    setView(v.value)
                    setDropdownOpen(false)
                  }}
                    >
                      {v.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="todo-list__header-right">
              {countLabel && <span className="todo-list__count">{countLabel}</span>}
              <button className="todo-list__search-btn" onClick={openSearch} aria-label="Search todos">
                <SearchIcon />
              </button>
              {view === 'upcoming' && (
                <button className="todo-list__add-btn" onClick={() => onAdd(today)} aria-label="Add todo">
                  +
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="todo-list__body">
        {displayGroups.length === 0 ? (
          <div className="todo-list__empty">
            {searchOpen ? (
              <>
                <span className="todo-list__empty-icon" style={{ fontSize: '18px', color: 'var(--color-text-faint)' }}>
                  <SearchIcon />
                </span>
                <p>{searchQuery ? `No results for "${searchQuery}"` : 'No todos found'}</p>
              </>
            ) : (
              <>
                <span className="todo-list__empty-icon">{view === 'completed' ? '○' : '✓'}</span>
                <p>{view === 'completed' ? 'No completed todos' : 'No upcoming todos'}</p>
                <p className="todo-list__empty-sub">
                  {view === 'completed'
                    ? 'Mark a todo as done to see it here'
                    : 'Click + or any day on the calendar to add one'}
                </p>
              </>
            )}
          </div>
        ) : (
          displayGroups.map(group => (
            <div key={group.label} className="todo-list__group">
              <h3 className="todo-list__group-label">{group.label}</h3>
              <ul className="todo-list__items">
                {group.todos.map(todo => {
                  const { day, weekday } = parseDateParts(todo.date)
                  return (
                    <li key={todo.id} className={['todo-list__item', todo.completed && 'todo-list__item--done', todo.id === clearingId && 'todo-list__item--clearing'].filter(Boolean).join(' ')}>
                      <button
                        className="todo-list__check"
                        onClick={() => handleToggle(todo.id)}
                        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <span className="todo-list__day-badge">{day}</span>
                        <span className="todo-list__uncheck-icon"><CheckboxEmptyIcon /></span>
                        {todo.completed && <span className="todo-list__check-mark">✓</span>}
                      </button>

                      <div className="todo-list__item-body" onClick={() => onTodoClick(todo)}>
                        <span className="todo-list__item-title">{todo.title}</span>
                        <span className="todo-list__item-weekday">{weekday}</span>
                      </div>

                      <button
                        className="todo-list__delete"
                        onClick={() => onTodoDelete(todo.id)}
                        aria-label="Delete"
                      >
                        ×
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
