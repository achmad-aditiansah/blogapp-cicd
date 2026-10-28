import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BlogForm from './BlogForm'

test('<BlogForm /> updates parent state and calls onSubmit', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(
    <MemoryRouter>
      <BlogForm createBlog={createBlog} />
    </MemoryRouter>
  )

  const inputTitle = screen.getByLabelText('title')
  const inputAuthor = screen.getByLabelText('author')
  const inputUrl = screen.getByLabelText('url')
  const createButton = screen.getByText('create')

  await user.type(inputTitle, 'PlayStation Plus New Free Game Playable Early With Nifty Hack')
  await user.type(inputAuthor, 'Kate Harrold')
  await user.type(inputUrl, 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416')
  await user.click(createButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('PlayStation Plus New Free Game Playable Early With Nifty Hack')
  expect(createBlog.mock.calls[0][0].author).toBe('Kate Harrold')
  expect(createBlog.mock.calls[0][0].url).toBe('https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416')
}, 5000)