import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import CognitoService from "../services/cognito.service";

class AuthController {
  public path = "/auth";
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post("/signUp", this.validateBody("signUp"), this.signUp);
    this.router.post("/signIn", this.validateBody("signIn"), this.signIn);
    this.router.post("/verify", this.validateBody("verify"), this.verify);
  }

  signUp = (req: Request, res: Response) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }
    console.log(req, 'body is valid');

		const { username, password, email, name, family_name,  birthdate } = req.body;
		let userAttr = [];
		userAttr.push({ Name: 'email', Value: email });
		userAttr.push({ Name: 'name', Value: name });
		userAttr.push({ Name: 'family_name', Value: family_name });
		userAttr.push({ Name: 'birthdate', Value: birthdate });


		const cognito = new CognitoService();
		cognito.signUpUser(username, password, userAttr)
			.then(success => {
				if(success) {
					res.status(200).end()
				}
				res.status(500).end();
			});

		return res.status(200).end();
  };

  signIn = (req: Request, res: Response) => {
		const result = validationResult(req);
		if (!result.isEmpty()) {
			return res.status(422).json({ errors: result.array() });
		}
		console.log(req.body);


		const { username, password } = req.body;
		let cognitoService = new CognitoService();
		cognitoService.signInUser(username, password)
			.then(success => {
				success ? res.status(200).end() : res.status(400).end()
			})
	}
	
  verify = (req: Request, res: Response) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json({ erros: result.array() });
    }

		const { username, code } = req.body;

		const cognito = new CognitoService();
		cognito.verifyAccount(username, code)
			.then(success => {
				if(success) {
					res.status(200).end();
				} else {
					res.status(500).end();
				}
			});

		console.log(req, 'body is valid');
		return res.status(200).end();
  }

  private validateBody(type: string) {
    switch (type) {
      case "signUp":
        return [
          body("username").notEmpty().isLength({ min: 5 }),
          body("email").notEmpty().normalizeEmail().isEmail(),
          body("password").isString().isLength({ min: 8 }),
          body("birthdate").exists().isISO8601(),
          body("gender").notEmpty().isString(),
          body("name").notEmpty().isString(),
          body("family_name").notEmpty().isString(),
        ];
      case "signIn":
        return [
          body("username").notEmpty().isLength({ min: 5 }),
          body("password").isString().isLength({ min: 8 }),
        ];
      case "verify":
        return [
          body("username").notEmpty().isLength({ min: 5 }),
          body("code").notEmpty().isString().isLength({ min: 6, max: 6 }),
        ];
    }
  }
}

export default AuthController;
