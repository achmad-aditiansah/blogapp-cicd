import { useParams, useNavigate } from 'react-router-dom'
import { Button, Box, Paper, Typography } from '@mui/material'

const Blog = ({ blog, increaseLike, deleteBlog, user, isUserLogin }) => {
  const id = useParams().id
  const navigate = useNavigate()

  if (!blog) {
    return null
  }

  const isOwner = blog.user.username === user?.username ? true : false

  const addLike = () => {
    increaseLike({
      ...blog,
      likes: blog.likes + 1
    })
  }

  const handleDelete = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      deleteBlog(id)
      navigate('/')
    }
  }

  return (
    <Box sx={{ marginTop: 3 }}>
      <Paper elevation={1} sx={{ padding: 4 }}>
        <Typography variant='h4' component='h2' gutterBottom sx={{ fontWeight: '500' }}>
          {blog.title}
        </Typography>

        <Typography variant='h6' color='textSecondary' gutterBottom>
          by {blog.author}
        </Typography>

        <Box sx={{ marginY: 2 }}>
          <Typography component="a" href={blog.url} sx={{ textDecoration: 'none', color: '#1976d2' }}>
            {blog.url}
          </Typography>
        </Box>

        <Typography variant="body1" color="textSecondary" gutterBottom>
          Added by {blog.user.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
          <Typography variant="body1">
            {blog.likes} likes
          </Typography>

          {isUserLogin && (
            <Button variant="outlined" size="small" onClick={addLike}>
              like
            </Button>
          )}

          {isOwner && (
            <Button variant="outlined" color="error" size="small" onClick={handleDelete}>
              remove
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default Blog