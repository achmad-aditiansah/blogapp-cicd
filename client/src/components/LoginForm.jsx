import { useState } from 'react'
import { TextField, Button, Box } from '@mui/material'

const LoginForm = ({ userLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (event) => {
    event.preventDefault()
    userLogin({
      username: username,
      password: password
    })
  }

  return(
    <div>
      <h2>Log in to application</h2>
      <Box component='form' onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          label='username'
          variant='standard'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label='password'
          type='password'
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type='submit' variant='contained' >
          login
        </Button>
      </Box>
    </div>
  )
}

export default LoginForm