import axios from 'axios'

// Response returned from reddit when querying a subredit's posts
interface PostsResponse {
  data: {
    children: {
      data: {
        title: string
        url: string
        id: string
        preview: {
          images: Image[]
        }
      }
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
      data: {
        id: string
        body: string
      }
    }[]
  }
}

interface Comment {
  id: string
  body: string
}

export const fetchPosts = async (subReddit: string): Promise<Post[]> => {
    const response: PostsResponse = (await axios.get(`https://www.reddit.com/r/${subReddit}.json`)).data
    return Promise.all(
      response.data.children.map(async (post) => {
        return { ...post.data, comments: await fetchComments(post.data.id) }
      }),
    )
}

const fetchComments = async (id: string) => {
  const response: CommentResponse[] = (await axios.get(`https://www.reddit.com/comments/${id}.json`)).data
  // Comment response returns an array, the first item in the array appears to be a comment generated
  // by the moderator?, so we grab the next array item (the actual post respones)
  return response[response.length - 1].data.children.map((comment) => {
    return comment.data
  })
}
