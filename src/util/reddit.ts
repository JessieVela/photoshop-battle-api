import axios from 'axios'
import { Post, Comment } from '../models/posts'

// Response returned from reddit when querying a subredit's posts
interface SubredditResponse {
  data: {
    children: {
      data: Post
    }[]
  }
}

// Response returned from reddit when querying a post's comments
interface CommentResponse {
  data: {
    children: {
      data: Comment
    }[]
  }
}

export default class Reddit {
  posts: Post[]
  subreddit: string
  interval: number // Interval to fetch Posts (default 60s)
  constructor(subreddit: string, interval: number = 60) {
    this.subreddit = subreddit
    this.posts = []
    this.interval = interval
  }

  run = async () => {
    try {
      this.posts = await this.fetchPosts()
      setInterval(async () => {
        try {
          this.posts = await this.fetchPosts()
        } catch (err) {
          console.error(err)
        }
      }, this.interval * 1000)
    } catch (err) {
      console.error(err)
    }
  }

  fetchPosts = async (): Promise<Post[]> => {
    const response: SubredditResponse = (await axios.get(`https://www.reddit.com/r/${this.subreddit}.json`)).data
    return Promise.all(
      response.data.children.map(async (post: { data: Post }) => {
        // Transform data from SubredditResponse to Post bc the SubredditResponse has a lot of properties we don't care about
        const { title, url, id, stickied, created_utc, author } = post.data
        const preview = { images: post.data.preview.images }
        const comments = await this.fetchComments(id)
        // TODO: handle 'undefined' comments
        return { title, url, id, preview, comments, stickied, created_utc, author }
      }),
    )
  }

  fetchComments = async (id: string): Promise<Comment[]> => {
    const response: CommentResponse[] = (await axios.get(`https://www.reddit.com/comments/${id}.json`)).data
    // Comment response returns an array, the first item in the array appears to be a comment generated
    // by the moderator?, so we grab the next array item (the actual post responses)
    return response[response.length - 1].data.children
      .filter(child => this.isValidComment(child.data.body)) // Remove deleted comments
      .map((comment: { data: Comment }) => {
        // Transform data from CommentResponse to Comment bc the CommentResponse has a lot of properties we don't care about
        const body = comment.data.body.split('\n').join(' ') // Remove empty lines TODO: only add one whitespace for all empty lines

        let text = ''
        let url = ''

        // Parse comments that put the image url in markdown.
        // Example: "[Spiderman in Prayer](https://imgur.com/gallery/zK1NiXa)"
        let match = body ? body.match(/\[(.*?)]\((.*?)\)/) : undefined
        text = match && match.length ? match[1] : ''
        url = match && match.length ? match[2] : ''

        // Parse commits that put the image tag as just plain text
        // Example: "https://imgur.com/a/aNP2s8k"
        if (!match || !match.length) {
          match = body ? body.match(/\bhttps?:\/\/\S+/gi) : undefined
          if (match && match.length) {
            url = match[0]
            text = body.replace(url, '')
          }
        }
        return { id: comment.data.id, url, text, body }
      })
  }
  isValidComment = (body: string): boolean => {
    return body !== '[deleted]' && body !== undefined && body !== '[removed]' && body !== ''
  }
}
