import { useState, useCallback, useEffect } from 'react'
import Calendar from './components/Calendar/Calendar'
import TodoList from './components/TodoList/TodoList'
import TodoModal from './components/TodoModal/TodoModal'
import './App.scss'
import plannerLogo from './assets/Planner-Logo.svg'

const SAMPLE_TODOS = [
  { id: 1, date: '2026-03-05', title: 'Team standup meeting', completed: false },
  { id: 2, date: '2026-03-10', title: 'Submit project report', completed: false },
  { id: 3, date: '2026-03-15', title: 'Dentist appointment', completed: false },
  { id: 4, date: '2026-03-22', title: 'Quarterly review', completed: false },
  { id: 5, date: '2026-04-03', title: 'Tax filing deadline', completed: false },
  { id: 6, date: '2026-04-18', title: 'Conference keynote', completed: false },
  { id: 7, date: '2026-05-01', title: 'Team offsite', completed: false },
]

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const stored = localStorage.getItem('planner-todos')
      return stored ? JSON.parse(stored) : SAMPLE_TODOS
    } catch {
      return SAMPLE_TODOS
    }
  })

  useEffect(() => {
    localStorage.setItem('planner-todos', JSON.stringify(todos))
  }, [todos])
  const [modal, setModal] = useState(null) // { date, todo? }
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const openAddModal = useCallback((date) => {
    setModal({ date, todo: null })
  }, [])

  const openEditModal = useCallback((todo) => {
    setModal({ date: todo.date, todo })
  }, [])

  const closeModal = useCallback(() => setModal(null), [])

  const saveTodo = useCallback(({ id, date, title }) => {
    if (id) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, date, title } : t))
    } else {
      setTodos(prev => [...prev, { id: Date.now(), date, title, completed: false }])
    }
    closeModal()
  }, [closeModal])

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }, [])

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">
          <img src={plannerLogo} className="app__title-icon" alt="" />
          Planner
        </h1>
      </header>

      <main className="app__body">
        <Calendar
          todos={todos}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onDayClick={openAddModal}
          onTodoClick={openEditModal}
          onTodoToggle={toggleTodo}
          onTodoDelete={deleteTodo}
        />

        <TodoList
          todos={todos}
          onAdd={openAddModal}
          onTodoClick={openEditModal}
          onTodoToggle={toggleTodo}
          onTodoDelete={deleteTodo}
        />
      </main>

      {modal && (
        <TodoModal
          date={modal.date}
          todo={modal.todo}
          onSave={saveTodo}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default App
