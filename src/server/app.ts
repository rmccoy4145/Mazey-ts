import express, {Express, Request, Response} from 'express';
import path from 'path'


const app : Express = express()
const port : number = 3000

// register the location of the static assets
app.use( express.static( 'public' ));
app.use( express.static( 'dist' ));

app.get( "/", ( req : Request, res : Response ) => {
  res.sendFile( path.join( __dirname + "/public/index.html" ));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })