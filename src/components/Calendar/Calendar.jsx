import { useMemo } from 'react'
import { MONTHS, todayStr } from '../../utils'
import './Calendar.scss'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells = []

  // trailing days from prev month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false, dateStr: null })
  }

  // current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, current: true, dateStr })
  }

  // leading days from next month
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, current: false, dateStr: null })
  }

  return cells
}

export default function Calendar({
  todos,
  currentMonth,
  onMonthChange,
  onDayClick,
  onTodoClick,
  onTodoToggle,
  onTodoDelete,
}) {
  const { year, month } = currentMonth
  const today = todayStr()

  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month])

  const todosByDate = useMemo(() => {
    const map = {}
    todos.forEach(todo => {
      if (!map[todo.date]) map[todo.date] = []
      map[todo.date].push(todo)
    })
    return map
  }, [todos])

  function changeMonth(delta) {
    const d = new Date(year, month + delta, 1)
    onMonthChange({ year: d.getFullYear(), month: d.getMonth() })
  }

  function goToToday() {
    const now = new Date()
    onMonthChange({ year: now.getFullYear(), month: now.getMonth() })
  }

  return (
    <div className="calendar">
      <div className="calendar__header">
        <div className="calendar__nav">
          <button className="calendar__nav-btn" onClick={() => changeMonth(-1)} aria-label="Previous month">
            ‹
          </button>
          <button className="calendar__nav-btn" onClick={() => changeMonth(1)} aria-label="Next month">
            ›
          </button>
        </div>
        <h2 className="calendar__month-title">
          {MONTHS[month]} <span className="calendar__year">{year}</span>
        </h2>
        <button className="calendar__today-btn" onClick={goToToday}>Today</button>
      </div>

      <div className="calendar__grid">
        {DAYS.map(d => (
          <div key={d} className="calendar__day-name">{d}</div>
        ))}

        {cells.map((cell, i) => {
          const isToday = cell.dateStr === today
          const cellTodos = cell.dateStr ? (todosByDate[cell.dateStr] || []) : []
          const isPast = cell.dateStr && cell.dateStr < today

          return (
            <div
              key={i}
              className={[
                'calendar__cell',
                !cell.current && 'calendar__cell--outside',
                isToday && 'calendar__cell--today',
                isPast && cell.current && 'calendar__cell--past',
              ].filter(Boolean).join(' ')}
              onClick={() => cell.current && onDayClick(cell.dateStr)}
            >
              <span className="calendar__cell-num">{cell.day}</span>

              {cellTodos.length > 0 && (
                <ul className="calendar__todos">
                  {cellTodos.map(todo => (
                    <li
                      key={todo.id}
                      className={['calendar__todo-item', todo.completed && 'calendar__todo-item--done'].filter(Boolean).join(' ')}
                      onClick={e => { e.stopPropagation(); onTodoClick(todo) }}
                    >
                      <button
                        className="calendar__todo-check"
                        onClick={e => { e.stopPropagation(); onTodoToggle(todo.id) }}
                        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {todo.completed ? '✓' : ''}
                      </button>
                      <span className="calendar__todo-title">{todo.title}</span>
                      <button
                        className="calendar__todo-delete"
                        onClick={e => { e.stopPropagation(); onTodoDelete(todo.id) }}
                        aria-label="Delete"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {cell.current && (
                <button className="calendar__add-btn" onClick={e => { e.stopPropagation(); onDayClick(cell.dateStr) }}>
                  +
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
