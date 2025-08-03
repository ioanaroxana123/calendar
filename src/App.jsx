import React, { useState, useRef, useEffect, use } from 'react';
import { Card, ListGroup, Form, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, isSameDay, isPast, getDay, addDays 
} from 'date-fns';
import { ro } from 'date-fns/locale';

const URL = 'https://calendar-backend-o918.onrender.com'

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ text: '', hour: '0' });
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const appRef = useRef(null);

  useEffect(() => {
    fetch(`${URL}/tasks`)
    .then(res => res.json())
    .then(data =>  {
        const tasksWithDates = data.map(task => ({
          ...task,
          date: new Date(task.date), 
        }));
        setTasks(tasksWithDates);
    })
    .catch((err) => console.log(err, "getting tasks"))
  }, [])

  const daysInMonth = eachDayOfInterval({
    start: addDays(startOfMonth(currentDate), -((getDay(startOfMonth(currentDate)) + 6) % 7)),
    end: addDays(endOfMonth(currentDate), (7 - (getDay(endOfMonth(currentDate)) + 6) % 7))
  });

  const weekdayNames = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];
  
  const dayColors = {
    'Luni': '#D7B9D5',
    'Marți': '#F5C9E0',
    'Miercuri': '#ADA7C9',
    'Joi': '#D0C3F1',
    'Vineri': '#D4B2E4',
    'Sâmbătă': '#C0F0F7',
    'Duminică': '#c6def1'
  };

  const isSameCalendarDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleAddTask = () => {
    if (!newTask.text.trim()) {
      alert('Te rog completează numele taskului');
      return;
    }

    const task = {
      id: Date.now(),
      text: newTask.text,
      hour: newTask.hour,
      completed: false,
      date: selectedDay
    }

    fetch(`${URL}/task`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(task), 
    })
    .then(response => {
      if(!response.ok)
        console.log("Error posting a task");
    })

    setTasks(prevTasks => [...prevTasks, task]);
    setTotalTasks(prev => prev + 1);
    setNewTask({ text: '', hour: '0' });
    setShowModal(false);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        setCompletedTasks(prev => newCompleted ? prev + 1 : prev - 1);
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  useEffect(() => {
    setTotalTasks(tasks.length);
    setCompletedTasks(tasks.filter(task => task.completed).length);
  }, [tasks]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (appRef.current && !appRef.current.contains(event.target)) {
        setSelectedDay(day);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={appRef} style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      backgroundColor: '#f0e3ea',
      fontFamily: "'Dancing Script', cursive",
      overflow: 'hidden'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
          
          ::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
          * {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          body {
            font-family: 'Dancing Script', cursive;
          }
          
          .month-header {
            font-family: 'Dancing Script', cursive;
            font-size: 2.5rem;
            font-weight: 700;
            color: #333;
          }
          
          .weekday-header {
            font-family: 'Dancing Script', cursive;
            font-size: 1.4rem;
            font-weight: 700;
            text-align: center;
            padding: 12px 0;
            border: 2px solid white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .day-cell {
            font-family: 'Dancing Script', cursive;
            font-size: 1.2rem;
            height: calc((100vh - 150px) / 6);
            border: 1px solid #e0e0e0;
            padding: 8px;
            overflow-y: auto;
            cursor: pointer;
            position: relative;
          }
          
          .current-day {
              background-color: inherit; /* Eliminăm fundalul colorat */
              border: 4px solid black !important; /* Bordură albă boldată */
              font-weight: bold; /* Text bold */
          }
          
          .other-month {
            opacity: 0.5;
            filter: blur(0.55px);
            background-color: #f8f9fa !important;
          }
          
          .task-item {
            font-family: 'Dancing Script', cursive;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            padding: 6px;
            margin: 4px 0;
            border-radius: 4px;
            background-color: rgba(255,255,255,0.8);
          }
          
          .past-day-marker {
            position: absolute;
            bottom: 8px;
            right: 8px;
            color: #4CAF50;
            font-size: 1.5rem;
            font-weight: bold;
            text-shadow: 0 0 2px rgba(255,255,255,0.7);
          }
          
          .form-control, .form-select, .form-label, .btn {
            font-family: 'Dancing Script', cursive;
            font-size: 1.1rem;
          }
          
          .form-control::placeholder {
            font-family: 'Dancing Script', cursive;
            opacity: 0.7;
          }

          .task-header-container {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }

          .task-icon {
            width: 24px;
            height: 24px;
            fill: white;
            filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
          }

          .task-list-title {
            font-family: 'Dancing Script', cursive;
            font-size: 2rem;
            font-weight: 700;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          }

          .day-task {
            color: #000 !important;
            text-shadow: 0 0 2px rgba(255,255,255,0.8);
            font-weight: 600;
            margin: 3px 0;
            padding: 3px;
            background-color: rgba(255,255,255,0.7);
            border-radius: 4px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            font-size: 0.9rem;
          }
        `}
      </style>

      {/* Partea stângă - Lista taskuri */}
      <div style={{ 
        width: '30%', 
        padding: '20px', 
        overflowY: 'auto',
        msOverflowStyle: 'none'
      }}>
        <Card style={{ 
          backgroundColor: '#FFFFFF',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Card.Body>
            <div className="month-header text-center">
              {format(currentDate, 'MMMM yyyy', { locale: ro })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0' }}>
              <Button variant="outline-secondary" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                ← Luna precedentă
              </Button>
              <Button variant="outline-secondary" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                Luna următoare →
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card style={{ 
          backgroundColor: '#b3d3da',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          height: '70%'
        }}>
          <Card.Body>
            <div className="task-header-container">
              <svg 
                className="task-icon"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 -960 960 960"
              >
                <path d="M620-163 450-333l56-56 114 114 226-226 56 56-282 282Zm220-397h-80v-200h-80v120H280v-120h-80v560h240v80H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v200ZM480-760q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z"/>
              </svg>
              <div>
                <h4 className="task-list-title">Listă Taskuri</h4>
                <div style={{ 
                  color: 'white', 
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '1.2rem'
                }}>
                  {completedTasks}/{totalTasks} completate
                </div>
              </div>
            </div>
            
            <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {tasks.map(task => (
                isSameMonth(task.date, currentDate) && <ListGroup.Item key={task.id} className="task-item">
                  <Form.Check 
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    style={{ marginRight: '10px' }}
                  />
                  <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.text}
                  </span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </div>

      {/* Partea dreaptă - Calendar */}
      <div style={{ 
        width: '70%', 
        padding: '20px', 
        msOverflowStyle: 'none',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px' }}>
          {weekdayNames.map((day, index) => (
            <div 
              key={day}
              className="weekday-header"
              style={{ 
                backgroundColor: dayColors[day],
                color: '#333'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
          {daysInMonth.map(day => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isSameDay(day, new Date());
            const dayOfWeek = weekdayNames[(getDay(day) + 6) % 7];
            const dayTasks = tasks.filter(task => task.date && isSameCalendarDate(task.date, day));

            return (
              <div
                key={day.toString()}
                className={`day-cell ${isCurrentDay ? 'current-day' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                onClick={() => {
                  if (isCurrentMonth) {
                    setSelectedDay(day);
                    setShowModal(true);
                  }
                }}
                style={{
                  backgroundColor: isCurrentMonth ? dayColors[dayOfWeek] : '#f8f9fa',
                  opacity: isPast(day) && !isCurrentDay ? 0.8 : 1
                }}
              >
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '5px',
                  color: '#333'
                }}>
                  {format(day, 'd')}
                </div>
                
                {dayTasks.map(task => (
                  <div key={task.id} className="day-task">
                    {task.hour}:00 - {task.text}
                  </div>
                ))}
                
                {isPast(day) && !isCurrentDay && (
                  <div className="past-day-marker">✓</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal pentru adăugare task */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Adaugă Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Ora</Form.Label>
            <Form.Select 
              value={newTask.hour}
              onChange={(e) => setNewTask({...newTask, hour: e.target.value})}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i}:00</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Nume Task</Form.Label>
            <Form.Control
              type="text"
              value={newTask.text}
              onChange={(e) => setNewTask({...newTask, text: e.target.value})}
              placeholder="Introdu numele taskului"
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Anulează
          </Button>
          <Button variant="primary" onClick={handleAddTask}>
            Adaugă
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;