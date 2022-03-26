const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) return response.status(404).json({ error: "User not found" });

  request.user = user;

  next();
}

app.post("/users", (request, response) => {
  if (!request.body)
    return response
      .status(400)
      .json({ error: "Bad request: Body is required" });

  const {
    body: { name, username },
  } = request;

  if (!name || !username)
    return response
      .status(400)
      .json({ error: "Bad Request: name and username required" });

  const userAlreadyExist = users.some((user) => user.username === username);

  if (userAlreadyExist)
    return response.status(400).json({ error: "User already exists" });

  const user = {
    id: uuid(),
    name: name,
    username: username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
  } = request;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
    body,
  } = request;

  const newTodo = { ...body, done: false, id: uuid(), created_at: new Date() };

  todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
    params,
    body,
  } = request;

  const todo = todos.find((todo) => todo.id === params.id);

  if (!todo) return response.status(404).json({ error: "Not Found" });

  todo.title = body.title;

  return response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
    params,
  } = request;

  const todo = todos.find((todo) => todo.id === params.id);

  if (!todo) return response.status(404).json({ error: "Not Found" });

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
    params,
  } = request;

  const todo = todos.find((todo) => todo.id === params.id);

  if (!todo) return response.status(404).json({ error: "Not Found" });

  todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
