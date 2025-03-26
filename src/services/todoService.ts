// Todo list service

import { TodoService, TodoTask } from './serviceInterfaces';
import { storeData, retrieveData } from '../utils/storageService';

export class LocalTodoService implements TodoService {
  name = 'Local Todo';
  
  get isConnected(): boolean {
    // This is a local service, so it's always connected
    return true;
  }
  
  connect(): Promise<boolean> {
    return Promise.resolve(true);
  }
  
  disconnect(): Promise<boolean> {
    return Promise.resolve(true);
  }
  
  getTasks(): Promise<TodoTask[]> {
    const result = retrieveData<TodoTask[]>('todo_tasks');
    const tasks = result.data || [];
    
    return Promise.resolve(tasks);
  }
  
  addTask(task: TodoTask): Promise<TodoTask> {
    // Get existing tasks
    return this.getTasks()
      .then(existingTasks => {
        // Create a new task with ID
        const newTask = {
          ...task,
          id: `task-${Date.now()}`
        };
        
        // Add to task list
        const updatedTasks = [...existingTasks, newTask];
        
        // Save updated list
        storeData('todo_tasks', updatedTasks);
        
        return newTask;
      });
  }
  
  updateTask(task: TodoTask): Promise<TodoTask> {
    return this.getTasks()
      .then(existingTasks => {
        // Find and update task
        const updatedTasks = existingTasks.map(t => 
          t.id === task.id ? task : t
        );
        
        // Save updated list
        storeData('todo_tasks', updatedTasks);
        
        return task;
      });
  }
  
  deleteTask(taskId: string): Promise<boolean> {
    return this.getTasks()
      .then(existingTasks => {
        // Remove task
        const updatedTasks = existingTasks.filter(t => t.id !== taskId);
        
        // Save updated list
        storeData('todo_tasks', updatedTasks);
        
        return true;
      });
  }
  
  completeTask(taskId: string): Promise<boolean> {
    return this.getTasks()
      .then(existingTasks => {
        // Find task and mark as completed
        const updatedTasks = existingTasks.map(t => 
          t.id === taskId ? { ...t, isCompleted: true } : t
        );
        
        // Save updated list
        storeData('todo_tasks', updatedTasks);
        
        return true;
      });
  }
}
