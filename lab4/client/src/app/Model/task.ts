export class Task {
  constructor(
    public _id: string,
    public title: string,
    public completed: boolean,
    public dueDate: Date,
    public fileName: string,
    public realFileName: string
  ) {}
}
