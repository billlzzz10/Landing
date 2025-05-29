
import { AppNote as Note } from '../types';
import { AppTask as Task } from '../types';

class LocalStorageService {
    private NOTES_KEY = 'ashval_notes';
    private TASKS_KEY = 'ashval_tasks';

    // Notes Management
    getNotes(): Note[] {
        try {
            const notes = localStorage.getItem(this.NOTES_KEY);
            return notes ? JSON.parse(notes) : [];
        } catch (error) {
            console.error("Error reading notes from localStorage:", error);
            return [];
        }
    }

    saveNotes(notes: Note[]): void {
        try {
            localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
        } catch (error) {
            console.error("Error saving notes to localStorage:", error);
        }
    }

    addNote(note: Note): void {
        const notes = this.getNotes();
        notes.push(note);
        this.saveNotes(notes);
    }

    updateNote(updatedNote: Note): void {
        let notes = this.getNotes();
        const index = notes.findIndex(note => note.id === updatedNote.id);
        if (index !== -1) {
            notes[index] = updatedNote;
            this.saveNotes(notes);
        }
    }

    deleteNote(noteId: string): void {
        const notes = this.getNotes().filter(note => note.id !== noteId);
        this.saveNotes(notes);
    }

    // Tasks Management
    getTasks(): Task[] {
         try {
            const tasks = localStorage.getItem(this.TASKS_KEY);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error("Error reading tasks from localStorage:", error);
            return [];
        }
    }

    saveTasks(tasks: Task[]): void {
        try {
            localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error("Error saving tasks to localStorage:", error);
        }
    }

    addTask(task: Task): void {
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
    }

    updateTask(updatedTask: Task): void {
        const tasks = this.getTasks();
        const index = tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
            tasks[index] = updatedTask;
            this.saveTasks(tasks);
        }
    }

    deleteTask(taskId: string): void {
        const tasks = this.getTasks().filter(task => task.id !== taskId);
        this.saveTasks(tasks);
    }
}

export default new LocalStorageService();