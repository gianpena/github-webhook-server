import express from 'express';
import { Webhooks } from '@octokit/webhooks';
import { exec } from 'child_process';
import path from 'path';


if(!process.env.SECRET) {
    console.log('SECRET KEY MISSING');
    process.exit(1);
}

const webhooks = new Webhooks({
    secret: process.env.SECRET,
});

const app = express();
const secret_verification_middleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if(!req.headers['x-hub-signature-256']) {
        res.status(403).send('Signature not found');
        return;
    }

    const signature = req.headers['x-hub-signature-256'] as string;
    const payload = req.body.toString();

    if(!(await webhooks.verify(payload, signature))) {
        res.status(401).send('Signature verification failed');
        return;
    }

    req.body = JSON.parse(payload);
    next();
};

app.use(express.raw({ type: 'application/json' }));
app.use(secret_verification_middleware);

app.post('/', async (req: express.Request, res: express.Response) => {
    console.log(req.body);
    const actionScript = path.join(process.cwd(), 'action.sh');
    exec(actionScript, (error, stdout, stderr) => {
        if (error) console.error(`action.sh error: ${error.message}`);
        if (stdout) console.log(`action.sh stdout: ${stdout}`);
        if (stderr) console.error(`action.sh stderr: ${stderr}`);
    });
    return res.status(200).send('OK');
});

app.listen(3000, () => {
    console.log('Listening on port 3000!');
});
