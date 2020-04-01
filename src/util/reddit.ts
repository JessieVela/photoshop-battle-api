import axios from 'axios'

// Response returned from reddit when querying a subredit's posts
interface SubredditResponse {
  data: {
    children: {
      data: Post
    }[]
  }
}

interface Post {
  title: string
  url: string
  id: string
  preview: {
    images: Image[]
  }
  comments: Comment[]
}

interface Image {
  source: Source
  resolutions: Source[]
}

interface Source {
  url: string
  width: number
  height: number
}

interface CommentResponse {
  data: {
    children: {
      data: Comment
    }[]
  }
}

interface Comment {
  id: string
  body: string
}

export const fetchPosts = async (subReddit: string): Promise<Post[]> => {
  const response: SubredditResponse = (await axios.get(`https://www.reddit.com/r/${subReddit}.json`)).data
  return Promise.all(
    response.data.children.map(async post => {
      // Transform data from SubredditResponse to Post bc the SubredditResponse has a lot of properties we don't care about
      const { title, url, id } = post.data
      const preview = { images: post.data.preview.images }
      const comments = await fetchComments(id)
      // TODO: handle 'undefined' comments
      return { title, url, id, preview, comments }
    }),
  )
}

const fetchComments = async (id: string) => {
  const response: CommentResponse[] = (await axios.get(`https://www.reddit.com/comments/${id}.json`)).data
  // Comment response returns an array, the first item in the array appears to be a comment generated
  // by the moderator?, so we grab the next array item (the actual post responses)
  return response[response.length - 1].data.children.map(comment => {
    // Transform data from CommentResponse to Comment bc the CommentResponse has a lot of properties we don't care about
    return { id: comment.data.id, body: comment.data.body }
  })
}
