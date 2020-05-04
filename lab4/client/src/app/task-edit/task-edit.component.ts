import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Task } from "../Model/task";
import { TaskService } from "../Service/task.service";
import { _sanitizeHtml } from "@angular/core/src/sanitization/html_sanitizer";
import { first } from "rxjs/operators";

@Component({
  selector: "app-task-edit",
  templateUrl: "./task-edit.component.html",
  styleUrls: ["./task-edit.component.css"]
})
export class TaskEditComponent {
  @Input() tasks: Task[];
  @Input() index: number;
  @Input("editPanel") showEditPanel: boolean;

  @Output() editHide: EventEmitter<boolean> = new EventEmitter<boolean>();

  _task: Task;
  attachedFile: any;

  constructor(private taskService: TaskService) {}

  public get task(): Task {
    if (!this._task) {
      if (this.index !== -1) {
        let task = this.tasks[this.index];
        this._task = new Task(task._id, task.title, task.completed, task.dueDate, task.fileName, task.realFileName);
      } else {
        this._task = new Task(undefined, "", false, new Date(), "", "");
      }
    }

    return this._task;
  }

  onDelete(taskId: string) {
    this.taskService
      .deleteTask(taskId)
      .pipe(first())
      .subscribe(flag => {
        if (flag) {
          this.tasks.splice(this.index, 1);
          this.onEditClose();
        }
      });
  }

  onEditClose() {
    this.showEditPanel = false;
    this.attachedFile = undefined;
    this._task = undefined;
    this.editHide.emit(false);
  }

  onSubmit() {
    if (!this.task._id) {
      this.taskService
        .addTask(this.task, this.attachedFile)
        .pipe(first())
        .subscribe(task => {
          this.tasks.push(task);
          this.onEditClose();
        });
    } else {
      this.taskService
        .updateTask(this.task, this.attachedFile)
        .pipe(first())
        .subscribe(task => {
          this.tasks[this.index] = task;
          this.onEditClose();
        });
    }
  }

  onFileChange(event: any) {
    this.attachedFile = event.target.files.item(0);
  }
}
