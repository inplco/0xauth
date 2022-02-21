import cors from 'cors';
import express from 'express';
import session from 'cookie-session';
import { generateNonce, SiweMessage } from 'siwe';

const app = express();
app.use(express.json());

/*
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://interplanetary.company/');
  next();
});
*/
const PORT = 8080;

app.use(cors());

console.log("Hello World!");
app.get('/state', async function (req, res) {
  res.end('NodeJS is running on port ' + PORT + '\n');
});

app.use(session({
    name: 'siwe-quickstart',
    secret: "siwe-quickstart-secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true }
}));

app.get('/nonce', async function (req, res) {
    req.session.nonce = generateNonce();
    /*
    res.setHeader('Access-Control-Allow-Origin', 'https://interplanetary.company');
    res.setHeader('Access-Control-Allow-credentials', true);
    */
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(req.session.nonce);
});

app.post('/verify', async function (req, res) {
    try {
        if (!req.body.message) {
            res.status(422).json({ message: 'Expected prepareMessage object as body.' });
            return;
        }

        let message = new SiweMessage(req.body.message);
        const fields = await message.validate(req.body.signature);
        if (fields.nonce !== req.session.nonce) {
            console.log(req.session);
            res.status(422).json({
                message: `Invalid nonce.`,
            });
            return;
        }
        req.session.siwe = fields;
        req.session.cookie.expires = new Date(fields.expirationTime);
        req.session.save(() => res.status(200).end());
    } catch (e) {
        req.session.siwe = null;
        req.session.nonce = null;
        console.error(e);
        switch (e) {
            case ErrorTypes.EXPIRED_MESSAGE: {
                req.session.save(() => res.status(440).json({ message: e.message }));
                break;
            }
            case ErrorTypes.INVALID_SIGNATURE: {
                req.session.save(() => res.status(422).json({ message: e.message }));
                break;
            }
            default: {
                req.session.save(() => res.status(500).json({ message: e.message }));
                break;
            }
        }
    }
});

app.get('/personal_information', function (req, res) {
    if (!req.session.siwe) {
        res.status(401).json({ message: 'Please Sign-in first' });
        return;
    }
    console.log("User is authenticated!");
    /*
    res.setHeader('Access-Control-Allow-Origin', 'https://interplanetary.company');
    res.setHeader('Access-Control-Allow-credentials', true);
    */
    res.setHeader('Content-Type', 'text/plain');
    res.send(`You are authenticated and your address is: ${req.session.siwe.address}`);
});
console.log("Sign-in with Ethereum server is listening on port " + PORT);
app.listen(PORT);
