import {Request, Response} from "express";
import reddit from "../models/posts";

export const getPosts = (req: Request, res: Response) => {
    res.json(reddit.posts)
}
