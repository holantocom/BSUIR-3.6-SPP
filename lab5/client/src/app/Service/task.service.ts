import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Task } from "../Model/task";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
    providedIn: "root"
})
export class TaskService {
    private url = environment.apiUrl + "api/tasks/";

    constructor(private apollo: Apollo, private http: HttpClient) {}

    getTasks(): Observable<Task[]> {
        let tasksQuery = gql`
      query tasks {
        tasks {
          ...userTask
        }
      }
      fragment userTask on Task {
        _id
        title
        completed
        dueDate
        fileName
        realFileName
      }
    `;

        return this.apollo
            .query<any>({
                query: tasksQuery
            })
            .pipe(
                map(({ data }) => data.tasks.map((value: any) => this.mapTask(value)))
            );
    }

    getTask(taskId: string): Observable<Task> {
        let taskByIdQuery = gql`
      query taskbyid($id: String!) {
        taskById(id: $id) {
          ...userTask
        }
      }
      fragment userTask on Task {
        _id
        title
        completed
        dueDate
        fileName
        realFileName
      }
    `;

        return this.apollo
            .query<any>({
                query: taskByIdQuery,
                variables: {
                    id: taskId
                }
            })
            .pipe(map(({ data }) => this.mapTask(data.taskById)));
    }

    addTask(task: Task, attachedFile: File): Observable<Task> {
        let createMutation = gql`
      mutation createTask($task: TaskInput!, $file: Upload) {
        createTask(task: $task, file: $file) {
          ...userTask
        }
      }
      fragment userTask on Task {
        _id
        title
        completed
        dueDate
        fileName
        realFileName
      }
    `;

        task._id = "";
        task.fileName = null;
        task.realFileName = null;

        return this.apollo
            .mutate<any>({
                mutation: createMutation,
                variables: {
                    task: task,
                    file: attachedFile
                }
            })
            .pipe(map(({ data }) => this.mapTask(data.createTask)));
    }

    updateTask(task: Task, attachedFile: any): Observable<Task> {
        let updateMutation = gql`
      mutation updateTask($task: TaskInput!, $file: Upload) {
        updateTask(task: $task, file: $file) {
          ...userTask
        }
      }
      fragment userTask on Task {
        _id
        title
        completed
        dueDate
        fileName
        realFileName
      }
    `;

        return this.apollo
            .mutate<any>({
                mutation: updateMutation,
                variables: {
                    task: task,
                    file: attachedFile
                }
            })
            .pipe(map(({ data }) => this.mapTask(data.updateTask)));
    }

    deleteTask(taskId: string): Observable<Boolean> {
        let deleteMutation = gql`
      mutation deleteTask($id: String!) {
        deleteTask(id: $id)
      }
    `;

        return this.apollo
            .mutate({
                mutation: deleteMutation,
                variables: {
                    id: taskId
                }
            })
            .pipe(map(({ data }) => data.deleteTask));
    }

    setTaskStatus(taskId: string, completedStatus: boolean): Observable<Boolean> {
        let setStatusMutation = gql`
      mutation setTaskStatus($id: String!, $completed: Boolean!) {
        setTaskStatus(id: $id, completed: $completed)
      }
    `;

        return this.apollo
            .mutate({
                mutation: setStatusMutation,
                variables: {
                    id: taskId,
                    completed: completedStatus
                }
            })
            .pipe(map(({ data }) => data.setTaskStatus));
    }

    removeFile(taskId: String): Observable<Boolean> {
        let removeFileMutation = gql`
      mutation deleteAttachedFile($id: String!) {
        deleteAttachedFile(id: $id)
      }
    `;

        return this.apollo
            .mutate({
                mutation: removeFileMutation,
                variables: {
                    id: taskId
                }
            })
            .pipe(map(({ data }) => data.deleteAttachedFile));
    }

    downloadFile(originalFileName: String): Observable<Blob> {
        return this.http.get(`${this.url}/download/${originalFileName}`, {
            responseType: "blob",
            headers: new HttpHeaders().append("Content-Type", "application/json")
        });
    }

    private mapTask(rawTask: any): Task {
        return new Task(
            rawTask._id,
            rawTask.title,
            rawTask.completed,
            rawTask.dueDate,
            rawTask.fileName,
            rawTask.realFileName
        );
    }
}