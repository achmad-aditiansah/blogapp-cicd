import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextField, Button, Box, Typography } from '@mui/material'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title: title,
      author: author,
      url: url
    })

    setTitle('')
    setAuthor('')
    setUrl('')
    navigate('/')
  }

  return (
    <Box sx={{ marginTop: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
        create new
      </Typography>
      <Box component='form' onSubmit={addBlog} sx={{ display: 'flex', flexDirection: 'column', gap: 2,  maxWidth: '500px' }}>
        <TextField
          label='title'
          variant='outlined'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size='small'
          fullWidth
        />
        <TextField
          label='author'
          variant='outlined'
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          size='small'
          fullWidth
        />
        <TextField
          label='url'
          variant='outlined'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          size='small'
          fullWidth
        />
        <Button type='submit' variant='contained' sx={{ width: 'fit-content' }}>create</Button>
      </Box>
    </Box>
  )
}

export default BlogForm