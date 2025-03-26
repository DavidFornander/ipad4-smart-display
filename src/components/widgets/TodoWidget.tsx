import React, { useState, useEffect } from 'react';
import styles from '../../styles/WidgetStyles.module.css';
import { TodoTask } from '../../services/serviceInterfaces';
import { LocalTodoService } from '../../services/todoService';
import { Loading, Error } from '../shared/LoadingError';

const TodoWidget: React.FC = () => {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [todoService] = useState(new LocalTodoService());
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  useEffect(() => {
    loadTasks();
  }, []);
  
  const loadTasks = () => {
    setLoading(true);
    todoService.getTasks()
      .then(fetchedTasks => {
        setTasks(fetchedTasks);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load tasks');
        setLoading(false);
        console.error('Todo error:', err);
      });
  };
  
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: TodoTask = {
      id: '', // Will be assigned by service
      title: newTaskTitle.trim(),
      isCompleted: false
    };
    
    todoService.addTask(newTask)
      .then(addedTask => {
        setTasks(prevTasks => [...prevTasks, addedTask]);
        setNewTaskTitle('');
      })
      .catch(err => {
        setError('Failed to add task');
        console.error('Add task error:', err);
      });
  };
  
  const toggleTaskCompletion = (taskId: string, isCompleted: boolean) => {
    if (isCompleted) {
      todoService.completeTask(taskId)
        .then(() => {
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === taskId ? { ...task, isCompleted: true } : task
            )
          );
        })
        .catch(err => {
          setError('Failed to update task');
          console.error('Complete task error:', err);
        });
    } else {
      // Find the task to update
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;
      
      todoService.updateTask({
        ...taskToUpdate,
        isCompleted: false
      })
        .then(updatedTask => {
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === taskId ? updatedTask : task
            )
          );
        })
        .catch(err => {
          setError('Failed to update task');
          console.error('Update task error:', err);
        });
    }
  };
  
  const deleteTask = (taskId: string) => {
    todoService.deleteTask(taskId)
      .then(() => {
        setTasks(prevTasks => 
          prevTasks.filter(task => task.id !== taskId)
        );
      })
      .catch(err => {
        setError('Failed to delete task');
        console.error('Delete task error:', err);
      });
  };
  
  if (loading) {
    return <Loading message="Loading tasks..." />;
  }
  
  if (error) {
    return <Error message={error} onRetry={loadTasks} />;
  }
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true; // 'all' filter
  });
  
  return (
    <div className={styles.todoWidget}>
      <div className={styles.addTaskForm}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') addTask();
          }}
          placeholder="Add a new task..."
          className={styles.taskInput}
        />
        <button 
          onClick={addTask}
          className={styles.addTaskButton}
          disabled={!newTaskTitle.trim()}
        >
          Add
        </button>
      </div>
      
      <div className={styles.filterTabs}>
        <button 
          className={`${styles.filterTab} ${filter === 'all' ? styles.activeTab : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'active' ? styles.activeTab : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'completed' ? styles.activeTab : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className={styles.emptyTasks}>
          <p>{filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}</p>
        </div>
      ) : (
        <ul className={styles.taskList}>
          {filteredTasks.map(task => (
            <li 
              key={task.id} 
              className={`${styles.taskItem} ${task.isCompleted ? styles.completedTask : ''}`}
            >
              <div className={styles.taskCheckbox}>
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleTaskCompletion(task.id, !task.isCompleted)}
                  id={`task-${task.id}`}
                  className={styles.hiddenCheckbox}
                />
                <label 
                  htmlFor={`task-${task.id}`}
                  className={styles.checkboxLabel}
                >
                  <span className={styles.customCheckbox}>
                    {task.isCompleted && <span className={styles.checkmark}>✓</span>}
                  </span>
                </label>
              </div>
              <span className={styles.taskTitle}>{task.title}</span>
              <button 
                className={styles.deleteTaskButton} 
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoWidget;
