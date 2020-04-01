import {Request, Response} from "express";
import reddit from "../models/posts";

export const getPosts = (req: Request, res: Response) => {
    res.status(200).send(reddit.posts)
}
