
const blogRouter = require('express').Router()
const Blog = require('../models/model')

blogRouter.get('/', (req, res) => {
    res.send('This is the blog root.');
})

blogRouter.get('/api/blog', (request, response) => {
    Blog
        .find({})
        .then(blogs => {
            response.json(blogs)
        })
})

blogRouter.post('/api/blog', (request, response) => {
    const blog = new Blog(request.body)

    blog
        .save()
        .then(result => {
            response.status(201).json(result)
        })
})

module.exports = blogRouter