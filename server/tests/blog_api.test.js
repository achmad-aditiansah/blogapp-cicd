const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/bloglist')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially some blogs saved', () => {
  let token

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const userData = await helper.createUser(api, { username: 'root', password: 'root', name: 'Superuser' })

    token = userData.token

    const user = await User.findOne({ username: 'root' })

    await Blog.insertMany(helper.blogsWithUser(user._id))
  })

  test('blogs are returned as json', async () => {
    await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.every(item => Object.hasOwn(item, 'id')), true)
  })

  describe('addition of a new blog', () => {
    test('succeeds with a valid data', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        title: 'PlayStation Plus New Free Game Playable Early With Nifty Hack',
        author: 'Kate Harrold',
        url: 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416',
        likes: 0
      }

      await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(201).expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('PlayStation Plus New Free Game Playable Early With Nifty Hack'))
    })

    test('missing likes property', async () => {
      const newBlog = {
        title: 'PlayStation Plus New Free Game Playable Early With Nifty Hack',
        author: 'Kate Harrold',
        url: 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416'
      }

      await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(201)

      const response = await api.get('/api/blogs')
      const addedBlog = response.body.find(b => b.title === newBlog.title)
      assert.strictEqual(addedBlog.likes, 0)
    })

    test('fails with status code 400 if title is missing', async () => {
      const newBlog = {
        author: 'Kate Harrold',
        url: 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416',
        likes: 0
      }

      await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(400)
    })

    test('fails with status code 400 if url is missing', async () => {
      const newBlog = {
        title: 'PlayStation Plus New Free Game Playable Early With Nifty Hack',
        author: 'Kate Harrold',
        likes: 0
      }

      await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(400)
    })

    test('fails with status code 401 if token is not provided', async () => {
      const newBlog = {
        title: 'PlayStation Plus New Free Game Playable Early With Nifty Hack',
        author: 'Kate Harrold',
        url: 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416',
        likes: 0
      }

      await api.post('/api/blogs').send(newBlog).expect(401)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const user = await User.findOne({ username: 'root' })

      const blogToDelete = blogsAtStart.find(b => b.user.id === user.id)

      await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${token}`).expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const ids = blogsAtEnd.map(b => b.id)
      assert(!ids.includes(blogToDelete.id))

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    })

    test('fails with status code 401 if token is not provided', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const user = await User.findOne({ username: 'root' })
      const blogToDelete = blogsAtStart.find(b => b.user.id === user.id)

      const result = await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)
      assert(result.body.error.includes('token missing'))
    })

    test('fails with status code 403 if a user trying to delete someone\'s blogs', async () => {
      const anotherUser = await helper.createUser(api, { username: 'user', password: 'sikrit', name: 'user' })
      const anotherUserToken = anotherUser.token

      const blogs = await helper.blogsInDb()
      const result = await api.delete(`/api/blogs/${blogs[0].id}`).set('Authorization', `Bearer ${anotherUserToken}`).expect(403)
      assert(result.body.error.includes('You do not have permission to delete this blog'))
    })
  })

  describe('update of a blog', () => {
    test('succeeds updated likes of a blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes + 1
      }

      await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      const updated = blogsAtEnd.find(b => b.id === blogToUpdate.id)

      assert.strictEqual(updated.likes, blogToUpdate.likes + 1)
    })

    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNoneExistingId = await helper.nonExistingId()
      const blog = {
        title: 'PlayStation Plus New Free Game Playable Early With Nifty Hack',
        author: 'Kate Harrold',
        url: 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416',
        likes: 0
      }

      await api.put(`/api/blogs/${validNoneExistingId}`).send(blog).expect(404)
    })

    test('fails with statuscode 400, id is invalid', async () => {
      const invalidId = 's0m31nv4l1d1d'
      const blog = {
        title: 'PlayStation Plus New Free Game Playable Early With Nifty Hack',
        author: 'Kate Harrold',
        url: 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416',
        likes: 0
      }

      await api.put(`/api/blogs/${invalidId}`).send(blog).expect(400)
    })
  })
})

describe('when there is initially one user in db',() => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sikrit', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hellas',
      name: 'Arto Hellas',
      password: 'sikrit'
    }

    await api.post('/api/users').send(newUser).expect(201).expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'sikrit'
    }

    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode if username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Arto Hellas',
      password: 'sikrit'
    }

    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('User validation failed: username: Path `username` is required'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode if the length of username is less than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'no',
      name: 'Arto Hellas',
      password: 'sikrit'
    }

    await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    const usernames = usersAtEnd.map(u => u.username)
    assert(!usernames.includes(newUser.username))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode if password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hellas',
      name: 'Arto Hellas'
    }

    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('password missing'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode if the length of password is less than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hellas',
      name: 'Arto Hellas',
      password: 'no'
    }

    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('the minimum length of a password is 3 characters'))

    const usernames = usersAtEnd.map(u => u.username)
    assert(!usernames.includes(newUser.username))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})