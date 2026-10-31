const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, likeBlog, likeBlogNTimes } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'superuser',
        username: 'root',
        password: 'secret'
      }
    })

    await page.goto('/')
  })
  
  test('Login form is shown', async ({ page }) => {
    await page.getByRole('link', { name: 'login' }).click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    beforeEach(async ({ page, request }) => {
      await request.post('/api/testing/reset')
      await request.post('/api/users', {
        data: {
          name: 'superuser',
          username: 'root',
          password: 'secret'
        }
      })
    })

    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByRole('link', { name: 'login' }).click()
      await loginWith(page, 'root', 'secret')
      await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByRole('link', { name: 'login' }).click()
      await loginWith(page, 'root', 'wrong')

      const errorMsg = page.locator('.error')
      await expect(page.getByText('wrong username or password')).toBeVisible()
      await expect(errorMsg).toHaveCSS('border-style', 'solid')
      await expect(errorMsg).toHaveCSS('color', 'rgb(95, 33, 32)')
      await expect(page.getByRole('button', { name: 'logout' })).not.toBeVisible()
    })
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'root', 'secret')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'created by playwright', 'developer', 'https://playwright.dev/')

      await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'created by playwright by' })).toBeVisible()
    })

    describe('and a blog exist', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'created by playwright', 'developer', 'https://playwright.dev/')
      })

      test('the blog can be liked', async ({ page }) => {
        await likeBlog(page, 'created by playwright', 10)
        await expect(page.getByText('10 likes')).toBeVisible()
      })

      test('only the user who added the blog can delete the blog', async({ page }) => {
        await page.getByRole('link', { name: 'created by playwright' }).click()
        
        page.on('dialog', async dialog => {
          await dialog.accept()
        })

        await page.getByRole('button', { name: 'remove' }).click()

        await expect(page.getByText('created by playwright developer')).not.toBeVisible()
      })
      
      test("only the user who added the blog sees the blog's delete button", async ({ page, request }) => {
        await page.getByRole('link', { name: 'created by playwright' }).click()
        await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()
        await page.getByRole('button', { name: 'logout' }).click()

        await request.post('/api/users', {
          data: {
            name: 'anotheruser',
            username: 'user1',
            password: 'secret1'
          }
        })

        await loginWith(page, 'user1', 'secret1')
        await page.getByRole('link', { name: 'created by playwright' }).click()
        await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
      })
    })
  })
})