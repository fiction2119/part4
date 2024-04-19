const { test, beforeEach, afterEach, describe } = require("node:test")
const assert = require("assert")
const mongoose = require("mongoose")
const Blog = require("../models/blog")
const User = require("../models/user")
const supertest = require("supertest")
const app = require("../app")
const helper = require("./api_helper")
const bcrypt = require("bcrypt")
const config = require("../utils/config")

const api = supertest(app)

beforeEach(async () => {
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  await Blog.deleteMany({})
  await User.deleteMany({})

  let blogObject = new Blog(helper.testBlogs[0])
  await blogObject.save()
  blogObject = new Blog(helper.testBlogs[1])
  await blogObject.save()

  const passwordHash = await bcrypt.hash("sekret", 10)
  const user = new User({ username: "root", passwordHash })
  await user.save()
})

describe("Blogs API Tests", () => {
  test("correct amount of blogs can be fetched", async () => {
    const response = await api.get("/api/blogs")
    assert.strictEqual(response.body.length, 2)
  })

  test("a new blog can be added ", async () => {
    const tokenInfo = await helper.getToken()

    const newBlog = {
      title: "foo",
      author: "bar",
      url: "http://www.foo.com",
      likes: 0,
      user: { id: tokenInfo.userId },
    }

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${tokenInfo.token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const entriesAtEnd = await helper.blogsInDb()
    assert.strictEqual(entriesAtEnd.length, helper.testBlogs.length + 1)

    const contents = entriesAtEnd.map((n) => {
      return n.title
    })

    assert(contents.includes("foo"))
  })

  test("likes=0 if missing", async () => {
    const tokenInfo = await helper.getToken()
    const newBlog = {
      title: "foo",
      author: "bar",
      url: "http://www.foo.com",
      user: { id: tokenInfo.userId },
    }
    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${tokenInfo.token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const response = await api.get("/api/blogs")
    const addedEntry = response.body.find((blog) => blog.title === "foo")

    const entriesAtEnd = await helper.blogsInDb()
    assert.strictEqual(entriesAtEnd.length, helper.testBlogs.length + 1)
    assert.strictEqual(addedEntry.likes, 0)
  })

  test("a blog can be deleted", async () => {
    const tokenInfo = await helper.getToken()

    const newBlog = {
      title: "foo",
      author: "bar",
      url: "http://www.foo.com",
      user: { id: tokenInfo.userId },
    }

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${tokenInfo.token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const blogsAtStart = await helper.blogsInDb()

    const addedEntry = blogsAtStart.find((blog) => blog.title === "foo")

    // delete request
    await api
      .delete(`/api/blogs/${addedEntry.id}`)
      .set("Authorization", `Bearer ${tokenInfo.token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, 2)
  })

  test("a blog can be updated", async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = { ...blogToUpdate, likes: 10 }

    await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlogInDb = blogsAtEnd.find(
      (blog) => blog.id === blogToUpdate.id
    )

    assert.strictEqual(updatedBlogInDb.likes, 10)
  })

  test("a blog cannot be added without a token", async () => {
    const tokenInfo = await helper.getToken()

    const newBlog = {
      title: "foo",
      author: "bar",
      url: "http://www.foo.com",
      likes: 0,
      user: { id: tokenInfo.userId },
    }

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(401)
      .expect("Content-Type", /application\/json/)
  })
})

describe("Users API Tests", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    }

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    assert(usernames.includes(newUser.username))
  })

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "root",
      name: "David",
      password: "salainen",
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    assert(result.body.error.includes("expected username to be unique"))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

afterEach(async () => {
  await mongoose.connection.close()
})
