import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

let pems = {};
class AuthMiddleware {
	private poolRegion: string = '';
	private privatePoolId = 'eu-north-1_99ZM1ISDE';


	constructor() {
		this.setUp();
	}

	verifyToken(req: Request, res: Response, next) {
		const token = req.header('Auth');
		console.log(token);

		if(!token) res.status(401).end();

		let decodeJwt: any = jwt.desode(token, { complete: true });
		if(!decodeJwt) {
			res.status(401).end();
		}

		let kid = decodeJwt.header.kid;
		let pem = pems[kid];
		if(!pem) {
			res.status(401).end()
		}

		jwt.verify(token, pem, (err, payload) => {
			if(err) {
				res.status(401).end()
			}
			next()
		})
	}

	private async setUp() {
		const URL = `https://cognito-idp.${this.poolRegion}.amazonaws.com/${this.privatePoolId}/.well-known/jwks.json`;

		try {
			const response = await fetch(URL);
			if(response.status !== 200) {
				throw `request not successful`
			}

			const data = await response.json();
			const { keys } = data;
			for (let i = 0; i < keys.length; i++) {
				const key_id = keys[i].kid;
				const modulus = keys[i].n;
				const exponent = keys[i].e;
				const key_type = keys[i].kty;
				const jwk = { kty: key_type, n: modulus, e: exponent };
				const pem = jwkToPem(jwk);
				pems[key_id] = pem;
			}

			console.log("got all pems")
		} catch (error) {
			console.log("sorry could not fetch jwks")
		}
	}
}

export default AuthMiddleware