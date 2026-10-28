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

  // test('Login form is shown', async ({ page }) => {
  //   await expect(page.getByRole('heading', { name: 'log in to application' })).toBeVisible()
  //   await expect(page.getByText('username')).toBeVisible()
  //   await expect(page.getByText('password')).toBeVisible()
  //   await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  // })
  
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

    // test('succeeds with correct credentials', async ({ page }) => {
    //   await loginWith(page, 'root', 'secret')
    //   await expect(page.getByText('superuser logged in')).toBeVisible()
    // })

    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByRole('link', { name: 'login' }).click()
      await loginWith(page, 'root', 'secret')
      await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
    })

    // test('fails with wrong credentials', async ({ page }) => {
    //   await loginWith(page, 'root', 'wrong')

    //   const errorMsg = page.locator('.error')
    //   await expect(errorMsg).toContainText('wrong username or password')
    //   await expect(errorMsg).toHaveCSS('border-style', 'solid')
    //   await expect(errorMsg).toHaveCSS('color', 'rgb(255, 0, 0)')
    //   await expect(page.getByText('superuser logged in')).not.toBeVisible()
    // })

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

    // test('a new blog can be created', async ({ page }) => {
    //   await createBlog(page, 'created by playwright', 'developer', 'https://playwright.dev/')

    //   const successMsg = page.locator('.success')
    //   await expect(successMsg).toContainText('a new blog created by playwright by developer added')
    //   await expect(successMsg).toHaveCSS('border-style', 'solid')
    //   await expect(successMsg).toHaveCSS('color', 'rgb(0, 128, 0)')

    //   await page.getByRole('button', { name: 'view' }).click()
    //   await expect(page.getByText('https://playwright.dev/')).toBeVisible()
    //   await expect(page.getByText('likes 0 like')).toBeVisible()
    //   await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()
    // })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'created by playwright', 'developer', 'https://playwright.dev/')

      await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'created by playwright by' })).toBeVisible()
    })

    describe('and a blog exist', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'created by playwright', 'developer', 'https://playwright.dev/')
      })

      // test('the blog can be liked', async ({ page }) => {
      //   await likeBlog(page, 'created by playwright', 10)
      //   await expect(page.getByText('likes 10 like')).toBeVisible()
      // })

      test('the blog can be liked', async ({ page }) => {
        await likeBlog(page, 'created by playwright', 10)
        await expect(page.getByText('10 likes')).toBeVisible()
      })

      // test('only the user who added the blog can delete the blog', async({ page }) => {
      //   await page.getByRole('button', { name: 'view' }).click()
        
      //   page.on('dialog', async dialog => {
      //     await dialog.accept()
      //   })

      //   await page.getByRole('button', { name: 'remove' }).click()

      //   await expect(page.getByText('created by playwright developer')).not.toBeVisible()
      // })

      test('only the user who added the blog can delete the blog', async({ page }) => {
        await page.getByRole('link', { name: 'created by playwright' }).click()
        
        page.on('dialog', async dialog => {
          await dialog.accept()
        })

        await page.getByRole('button', { name: 'remove' }).click()

        await expect(page.getByText('created by playwright developer')).not.toBeVisible()
      })

      // test("only the user who added the blog sees the blog's delete button", async ({ page, request }) => {
      //   await page.getByRole('button', { name: 'view' }).click()
      //   await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()
      //   await page.getByRole('button', { name: 'logout' }).click()

      //   await request.post('/api/users', {
      //     data: {
      //       name: 'anotheruser',
      //       username: 'user1',
      //       password: 'secret1'
      //     }
      //   })

      //   await loginWith(page, 'user1', 'secret1')
      //   await expect(page.getByText('anotheruser logged in')).toBeVisible()
      //   await page.getByRole('button', { name: 'view' }).click()
      //   await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
      // })
      
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

    // describe('and several blogs exists', () => {
    //   beforeEach(async ({ page }) => {
    //     await createBlog(page, 'first blog', 'playwright', 'https://playwright.dev/')
    //     await createBlog(page, 'second blog', 'playwright', 'https://playwright.dev/')
    //     await createBlog(page, 'third blog', 'playwright', 'https://playwright.dev/')
    //   })

    //   test('they are arranged in order according to the likes, with the most likes first', async ({ page }) => {
    //     await likeBlog(page, 'first blog')
    //     await likeBlog(page, 'second blog', 2)
    //     await likeBlog(page, 'third blog', 3)

    //     await page.waitForTimeout(500)

    //     const blogItems = await page.getByTestId('blog-item').all()
        
    //     await expect(blogItems[0]).toContainText('third blog')
    //     await expect(blogItems[1]).toContainText('second blog')
    //     await expect(blogItems[2]).toContainText('first blog')
    //   })
    // })
  })
})