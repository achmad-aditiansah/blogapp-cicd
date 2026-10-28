import { expect, test } from 'vitest'
import Blog from './Blog'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const renderWithRouter = (component, route = '/blogs/1') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/blogs/:id" element={component} />
      </Routes>
    </MemoryRouter>
  )
}

test('unauthenticated user sees blog info but no buttons', () => {
  const blog = {
    id: '1',
    title: 'PlayStation Plus New Free Game Playable Early With Nifty Hack',
    author: 'Kate Harrold',
    url: 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416',
    likes: 5,
    user: {
      username: 'bloggers',
      name: 'bloggers'
    }
  }

  renderWithRouter(
    <Blog blog={blog} isUserLogin={false} user={null}/>
  )

  expect(screen.getByText('PlayStation Plus New Free Game Playable Early With Nifty Hack')).toBeVisible()
  expect(screen.getByText('by Kate Harrold')).toBeVisible()
  expect(screen.getByText('https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416')).toBeVisible()
  expect(screen.getByText('5 likes')).toBeVisible()

  expect(screen.queryByText('like')).toBeNull()
  expect(screen.queryByText('remove')).toBeNull()
})

test('non-owner user sees like button but not remove button', () => {
  const blog = {
    id: '1',
    title: 'PlayStation Plus New Free Game Playable Early With Nifty Hack',
    author: 'Kate Harrold',
    url: 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416',
    likes: 5,
    user: {
      username: 'bloggers',
      name: 'bloggers'
    }
  }

  const user = {
    username: 'anotherBloggers'
  }

  renderWithRouter(
    <Blog blog={blog} isUserLogin={true}  user={user}/>
  )

  expect(screen.getByText('PlayStation Plus New Free Game Playable Early With Nifty Hack')).toBeVisible()
  expect(screen.getByText('by Kate Harrold')).toBeVisible()
  expect(screen.getByText('https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416')).toBeVisible()
  expect(screen.getByText('5 likes')).toBeVisible()

  expect(screen.getByText('like')).toBeVisible()
  expect(screen.queryByText('remove')).toBeNull()
})

test('the creator of blog sees both like and remove button', () => {
  const blog = {
    id: '1',
    title: 'PlayStation Plus New Free Game Playable Early With Nifty Hack',
    author: 'Kate Harrold',
    url: 'https://www.gamingbible.com/news/platform/playstation/playstation-plus-new-free-game-playable-early-hack-369024-20260416',
    likes: 5,
    user: {
      username: 'bloggers',
      name: 'bloggers'
    }
  }

  const user = {
    username: 'bloggers'
  }

  renderWithRouter(
    <Blog blog={blog} isUserLogin={true} user={user}/>
  )

  expect(screen.getByText('like')).toBeVisible()
  expect(screen.getByText('remove')).toBeVisible()
})