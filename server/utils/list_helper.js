// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogPosts) => {
  const countLikes = blogPosts.reduce((acc, currItem) => {
    return acc + currItem.likes
  }, 0)

  return blogPosts.length === 0 ? 0 : countLikes
}

const favoriteBlog = (blogPosts) => {
  if (blogPosts.length === 0) {
    return 0
  }

  return blogPosts.reduce((prev, curr) => {
    return prev.likes > curr.likes ? prev : curr
  })
}

const mostBlogs = (blogPosts) => {
  if (blogPosts.length === 0) {
    return 0
  }

  const counts = blogPosts.reduce((acc, post) => {
    acc[post.author] = (acc[post.author] || 0) + 1
    return acc
  }, {})

  const topAuthor = Object.keys(counts).reduce((a, b) => {
    return counts[a] > counts[b] ? a : b
  })

  return {
    author: topAuthor,
    blogs: counts[topAuthor]
  }
}

const mostLikes = (blogPosts) => {
  if (blogPosts.length === 0) {
    return 0
  }

  const likesByAuthor = blogPosts.reduce((acc,  blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + blog.likes
    return acc
  }, {})

  const topAuthor = Object.keys(likesByAuthor).reduce((a, b) => {
    return likesByAuthor[a] > likesByAuthor[b] ? a : b
  })

  return {
    author: topAuthor,
    likes: likesByAuthor[topAuthor]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}