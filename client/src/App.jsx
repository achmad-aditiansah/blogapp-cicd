import { useState, useEffect } from 'react'
import {
  Routes, Route, Link, useMatch, useNavigate, Navigate
} from 'react-router-dom'
import { Container, AppBar, Toolbar, Button, Typography, Box } from '@mui/material'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService  from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import BlogList from './components/BlogList'
import LoginForm from './components/LoginForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistsappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const userLogin = async credentials => {
    try {
      const user = await loginService.login(credentials)
      window.localStorage.setItem('loggedBloglistsappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      navigate('/')
    } catch {
      setNotification({ text: 'wrong username or password', type: 'error' })
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  const addBlog = async (blogObject) => {
    const blog = await blogService.create(blogObject)
    setBlogs(prevBlogs => prevBlogs.concat({ ...blog, user: user }))
    navigate('/')
    setNotification({ text: `a new blog ${blog.title} by ${blog.author} added`, type:'success' })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const  addLike = async (blogObject) => {
    const response = await blogService.update(blogObject.id, blogObject)

    setBlogs(prevBlogs => prevBlogs.map(blog => blog.id === blogObject.id ? { ...response, user: blog.user } : blog ))
  }

  const deleteBlog = async (id) => {
    await blogService.del(id)
    setBlogs(blogs.filter(b => b.id !== id))
    navigate('/')
  }

  const handleLogout = async () => {
    window.localStorage.removeItem('loggedBloglistsappUser')
    setUser(null)
    navigate('/')
  }

  const hoverStyle = { '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }

  const match  = useMatch('/blogs/:id')
  const blog = match ? blogs.find(blog => blog.id === match.params.id) : null

  return (
    <Container>
      <AppBar component='nav'>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Blog App
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button color='inherit' component={Link} to="/" sx={hoverStyle} key='blogs'>blogs</Button>
            {user
              ? (<Button color='inherit' component={Link} to="/create" sx={hoverStyle} key='new blog'>new blog</Button>)
              : (<Button color='inherit' component={Link} to="/login" sx={hoverStyle} key='login'>login</Button>)
            }
            {user && (<Button color='inherit' onClick={handleLogout} sx={hoverStyle} key='logout'>logout</Button>)}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Notification notification={notification} style={{ marginTop: 10 }}/>

      <Routes>
        <Route path="/" element={
          <BlogList blogs={blogs} />
        } />
        <Route path="/blogs/:id" element={
          <Blog blog={blog} increaseLike={addLike} deleteBlog={deleteBlog} user={user} isUserLogin={user !== null}/>
        }/>
        <Route path="/login" element={
          user ? <Navigate replace to="/" /> : <LoginForm userLogin={userLogin} />
        } />
        <Route path="/create" element={
          user ? <BlogForm createBlog={addBlog}/> : <Navigate replace to="/login" />
        } />
      </Routes>
    </Container>
  )
}

export default App