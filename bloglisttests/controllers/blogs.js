const blogRouter = require("express").Router()
const Blog = require("../models/blog")
const User = require("../models/user")
const jwt = require("jsonwebtoken")

blogRouter.get("/", (req, res) => {
  res.send("This is the blog root.")
})

blogRouter.get("/api/blogs", async (request, response) => {
  const blogs = await Blog.find({}).populate("user")

  response.json(blogs.map((blog) => blog.toJSON()))
})

blogRouter.post("/api/blogs", async (request, response) => {
  if (!request.user) {
    return response
      .status(401)
      .json({ error: "Unauthorized: No valid token provided" })
  }
  const user = await User.findById(request.user.id)
  if (!user) return response.status(404).send({ error: "User not found" })

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  const blogToReturn = await Blog.findById(savedBlog._id).populate(
    "user",
    "username name"
  )
  response.status(201).json(blogToReturn)
})

blogRouter.delete("/api/blogs/:id", async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).send({ message: "Blog not found." })
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken || !decodedToken.id) {
      return response.status(401).send({ message: "Invalid token." })
    }

    if (blog.user.toString() === decodedToken.id.toString()) {
      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).end()
    } else {
      response
        .status(403)
        .send({ message: "Unauthorized attempt to delete blog." })
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
})

blogRouter.put("/api/blogs/:id", async (request, response, next) => {
  const newLikes = request.body.likes
  const id = request.params.id

  const updatedBlog = await Blog.findByIdAndUpdate(
    { _id: id },
    { $set: { likes: newLikes } },
    { new: true }
  )

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).send({ error: "Blog post not found" })
  }
})

module.exports = blogRouter
