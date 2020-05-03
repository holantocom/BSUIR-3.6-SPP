import { Injectable, OnDestroy } from "@angular/core";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { Task } from "../Model/task";
import * as io from "socket.io-client";
import { UserService } from "./user.service";

@Injectable({
  providedIn: "root"
})
export class TaskService implements OnDestroy {
  private socket: SocketIOClient.Socket;
  private socketPath = "/socket/tasks";

  constructor() {
    this.socket = io(environment.apiUrl, {
      path: this.socketPath,
      query: {
        token: UserService.token
      }
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  onUnauthorized(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on("unauthorized", () => observer.next());
    });
  }

  getTasks(): Observable<Array<Task>> {
    this.socket.emit("tasks");
    return new Observable<Array<Task>>(observer => {
      this.socket.on("tasks", (tasks: Array<Task>) => observer.next(tasks));
    });
  }

  getTask(taskId: string): Observable<Task> {
    this.socket.emit("taskbyid", taskId);
    return new Observable<Task>(observer => {
      this.socket.on("taskbyid", (task: Task) => observer.next(task));
    });
  }

  addTask(task: Task, attachedFile: any): Observable<Task> {
    if (attachedFile) {
      let fileReader = new FileReader();
      let slice = attachedFile.slice(0, attachedFile.size);
      fileReader.readAsArrayBuffer(slice);
      fileReader.onloadend = ev => {
        var arrayBuffer = fileReader.result;
        this.socket.emit("create", {
          task: task,
          file: { fileName: attachedFile.name, data: arrayBuffer }
        });
      };
    } else {
      this.socket.emit("create", { task: task, file: undefined });
    }

    return new Observable<Task>(observer => {
      this.socket.on("create", (task: Task) => observer.next(task));
    });
  }

  updateTask(task: Task, attachedFile: any): Observable<Task> {
    if (attachedFile) {
      let fileReader = new FileReader();
      let slice = attachedFile.slice(0, attachedFile.size);
      fileReader.readAsArrayBuffer(slice);
      fileReader.onloadend = ev => {
        var arrayBuffer = fileReader.result;
        this.socket.emit("update", {
          id: task._id,
          task: task,
          file: { fileName: attachedFile.name, data: arrayBuffer }
        });
      };
    } else {
      this.socket.emit("update", { id: task._id, task: task, file: undefined });
    }

    return new Observable<Task>(observer => {
      this.socket.on("update", (task: Task) => observer.next(task));
    });
  }

  deleteTask(taskId: string): Observable<Boolean> {
    this.socket.emit("delete", taskId);
    return new Observable<Boolean>(observer => {
      this.socket.on("delete", (flag: Boolean) => observer.next(flag));
    });
  }

  setTaskStatus(taskId: string, completedStatus: boolean): Observable<Boolean> {
    this.socket.emit("status", { id: taskId, status: completedStatus });
    return new Observable<Boolean>(observer => {
      this.socket.on("status", (flag: Boolean) => observer.next(flag));
    });
  }

  removeFile(taskId: String): Observable<Boolean> {
    this.socket.emit("deletefile", taskId);
    return new Observable<Boolean>(observer => {
      this.socket.on("deletefile", (flag: Boolean) => observer.next(flag));
    });
  }

  downloadFile(originalFileName: String): Observable<Blob> {
    this.socket.emit("download", originalFileName);
    return new Observable<Blob>(observer => {
      this.socket.on("download", (data: ArrayBuffer) =>
        observer.next(new Blob([data], { type: "application/octet-stream" }))
      );
    });
  }
}
