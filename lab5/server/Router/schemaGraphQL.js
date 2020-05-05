const resolvers = require("./resolverGraphQL");
const { gql, ApolloServer } = require("apollo-server-express");

const schema = gql`
  type Query {
    signout: Boolean
    tasks: [Task]
    taskById(id: String!): Task
  }
  type Mutation {
    signin(login: String!, password: String!): String
    signup(user: UserInput!): User
    createTask(task: TaskInput!, file: Upload): Task
    updateTask(task: TaskInput!, file: Upload): Task
    deleteTask(id: String!): Boolean
    setTaskStatus(id: String!, completed: Boolean!): Boolean
    deleteAttachedFile(id: String!): Boolean
  }
  input UserInput {
    login: String!
    password: String!
  }
  type User {
    login: String!
  }
  input TaskInput {
    _id: String!
    title: String!
    completed: Boolean!
    dueDate: DateTime!
    fileName: String
    realFileName: String
  }
  type Task {
    _id: String!
    title: String!
    completed: Boolean!
    dueDate: DateTime!
    fileName: String
    realFileName: String
  }
  scalar DateTime
`;

module.exports = new ApolloServer({
    typeDefs: schema,
    resolvers: resolvers,
    introspection: true,
    playground: {
        settings: {
            "editor.theme": "light"
        }
    },
    formatError: error => {
        let errorInfo = error.message.split("|");
        return {
            code: errorInfo[0],
            message: errorInfo[1]
        };
    },
    context: ({ req }) => {
        if (req.user) {
            return { userId: req.user.userId };
        } else {
            return {};
        }
    }
});