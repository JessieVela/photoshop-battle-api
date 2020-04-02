import axios from 'axios'

// Response returned from reddit when querying a subredit's posts
interface SubredditResponse {
  data: {
    children: {
      data: Post
    }[]
  }
}

// Our generic Post interface
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

// Response returned from reddit when querying a post's comments
interface CommentResponse {
  data: {
    children: {
      data: Comment
    }[]
  }
}

// Our generic Comment interface
interface Comment {
  id: string
  // TODO: should probably parse the body and return { text: string, url: string }
  body: string
  url: string
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
        const { title, url, id } = post.data
        const preview = { images: post.data.preview.images }
        const comments = await this.fetchComments(id)
        // TODO: handle 'undefined' comments
        return { title, url, id, preview, comments }
      }),
    )
  }

  fetchComments = async (id: string) => {
    const response: CommentResponse[] = (await axios.get(`https://www.reddit.com/comments/${id}.json`)).data
    // Comment response returns an array, the first item in the array appears to be a comment generated
    // by the moderator?, so we grab the next array item (the actual post responses)
    return response[response.length - 1].data.children.map((comment: { data: Comment }) => {
      // Transform data from CommentResponse to Comment bc the CommentResponse has a lot of properties we don't care about
      const body = comment.data.body
      // Parse comments that put the imnage url in markdown.
      // Example: "[Spiderman in Prayer](https://imgur.com/gallery/zK1NiXa)"
      let match = body ? body.match(/\[(.*?)]\((.*?)\)/) : undefined
      // Parse commits that put the image tag as just plain text
      // Example: "https://imgur.com/a/aNP2s8k"
      if (!match || !match.length) match = body ? body.match(/\bhttps?:\/\/\S+/gi) : undefined
      const text = match && match.length ? match[1] : ''
      const url = match && match.length ? match[2] : ''
      return { id: comment.data.id, body, url, text }
    })
  }
}
