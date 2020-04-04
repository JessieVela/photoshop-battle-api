import Reddit from "../util/reddit";
// Generic Post interface
export interface Post {
    title: string
    url: string
    id: string
    stickied: boolean,
    created_utc: number,
    author: string,
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

// Generic Comment interface
export interface Comment {
    id: string
    body: string
    url: string
    text: string
}
const reddit = new Reddit('photoshopbattles')
reddit.run()

export const get = (): Post[] => {
    return reddit.posts
}

// export default reddit
