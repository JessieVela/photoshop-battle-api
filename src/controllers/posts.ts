import {Request, Response} from "express";
import * as posts from "../models/posts";

export const getPosts = (req: Request, res: Response) => {
        res.json(posts.get());
}
