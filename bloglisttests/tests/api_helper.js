const Blog = require("../models/blog")
const User = require("../models/user")
const supertest = require("supertest")
const app = require("../app")
const api = supertest(app)

const testBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: "7",
    user: "662152c81770f5bcc8c804da",
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_and_plagiarism/new_stuff/GoToConsideredHarmful.html",
    likes: "5",
    user: "662152c81770f5bcc8c804da",
  },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

async function getToken() {
  const response = await api
    .post("/api/login")
    .send({ username: "root", password: "sekret" })

  if (response.status !== 200) {
    throw new Error("Failed to log in")
  }
  return { token: response.body.token, userId: response.body.id }
}

module.exports = {
  testBlogs,
  blogsInDb,
  usersInDb,
  getToken,
}
