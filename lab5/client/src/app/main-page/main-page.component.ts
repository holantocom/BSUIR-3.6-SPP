import { Component, OnInit } from "@angular/core";
import { Task } from "../Model/task";
import { TaskService } from "../Service/task.service";
import { saveAs } from "file-saver";
import { UserService } from "../Service/user.service";
import { Router } from "@angular/router";
import { first } from "rxjs/operators";

@Component({
  selector: "app-main-page",
  templateUrl: "./main-page.component.html",
  styleUrls: ["./main-page.component.css"],
  providers: [TaskService]
})

export class MainPageComponent implements OnInit {
  tasks: Task[];
  filter: boolean;
  editPanel: boolean;
  selectedIndex: number;
  lastColumn: string;
  direction: string;

  constructor(
    private router: Router,
    private taskService: TaskService,
    private userService: UserService
  ) {}

  get visibleTasks(): Task[] {
    if (this.filter !== undefined) {
      return this.tasks.filter(task => task.completed == this.filter);
    } else {
      return this.tasks;
    }
  }

  ngOnInit() {
    this.getTasks();
    this.editPanel = false;
    this.lastColumn = '';
    this.direction = 'asc';
  }

  onDelete(taskId: string) {
    let index = this.tasks.findIndex(task => task._id == taskId);
    this.taskService
      .deleteTask(taskId)
      .pipe(first())
      .subscribe(flag => {
        if (flag) {
          this.tasks.splice(index, 1);
          this.editPanel = false;
        }
      });
  }

  signout() {
    this.userService.signout();
    this.router.navigate(["/signin"]);
  }

  editHide(value: boolean) {
    this.editPanel = value;
  }

  getTasks() {
    this.taskService
      .getTasks()
      .pipe(first())
      .subscribe(
        tasks => {
          this.tasks = tasks;
          this.filter = undefined;
        },
        error => {
          this.tasks = [
            new Task("1", "my", false, new Date(), undefined, undefined)
          ];
        }
      );
  }

  onFilterChange(filterValue: any) {
    if (filterValue != "undefined") {
      this.filter = filterValue == "true";
    } else {
      this.filter = undefined;
    }
  }

  onStatusChange(taskId: string, completed: boolean) {
    this.taskService
      .setTaskStatus(taskId, completed)
      .pipe(first())
      .subscribe(flag => {
        if (flag) {
          const index: number = this.tasks.findIndex(
            value => value._id == taskId
          );
          if (index != -1) {
            this.tasks[index].completed = completed;
          }
        }
      });
  }

  onEdit(taskId: string) {
    this.selectedIndex = this.tasks.findIndex(value => value._id === taskId);
    this.editPanel = true;
  }

  onTaskAdd() {
    this.editPanel = true;
    this.selectedIndex = -1;
  }

  onDownload(taskId: String) {
    let task = this.tasks.find(value => value._id == taskId);

    if (task != undefined) {
      this.taskService
        .downloadFile(task.realFileName)
        .pipe(first())
        .subscribe(data => {
          saveAs(data, task.fileName);
        });
    }
  }

  onFileRemove(taskId: String) {
    this.taskService
      .removeFile(taskId)
      .pipe(first())
      .subscribe(flag => {
        if (flag) {
          let task = this.tasks.find(value => value._id == taskId);
          task.fileName = undefined;
          task.realFileName = undefined;
        }
      });
  }

  onSort(column: string){

    if(this.lastColumn != column){

      this.lastColumn = column;
      this.direction = 'asc';
      this.tasks.sort((a, b) => {
        const res = a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0;;
        return res;
      });

    } else {
      
      this.direction = (this.direction == 'asc') ? 'desc' : 'asc';

      this.tasks.sort((a, b) => {
        const res = a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0;;
        return this.direction === 'asc' ? res : -res;
      });

    }

  }

}
