const loginWith = async (page, username, password) => {
  await page.getByRole('link', { name: 'login' }).click()
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('link', { name: 'new blog' }).click()
  await page.getByRole('textbox', { name: 'title' }).fill(title)
  await page.getByRole('textbox', { name: 'author' }).fill(author)
  await page.getByRole('textbox', { name: 'url' }).fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByRole('heading', { name: 'blogs' }).waitFor()
}

// const likeBlog = async (page, title, times = 1) => {
//   const blogContainer = page.getByTestId('blog-item').filter({ hasText: title })
//   await blogContainer.getByRole('button', { name: 'view' }).click()
//   const likeButton = blogContainer.getByRole('button', { name: 'like' })

//   for (let i = 0; i < times; i++) {
//     await likeButton.click()
//     await page.waitForTimeout(100) 
//   }
// }

const likeBlog = async (page, title, times = 1) => {
  await page.getByRole('link', { name: title }).click()
  const likeButton = page.getByRole('button', { name: 'like' })

  for (let i = 0; i < times; i++) {
    await likeButton.click()
    await page.waitForTimeout(100) 
  }
}

export { loginWith, createBlog, likeBlog }