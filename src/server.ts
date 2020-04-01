import app from "./app";
import * as reddit from './util/reddit'

const server = app.listen(app.get("port"), () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
});

reddit.fetchPosts('photoshopbattles').then((data => {
    console.log(data)
}))

export default server;
