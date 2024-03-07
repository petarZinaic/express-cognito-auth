import express, { Request, Response } from 'express';
import AuthMiddleware from '../middleware/auth.middleware';

class ProtectedController {
	public path = '/protected';
	public router = express.Router();
	private authMiddleware;

	constructor() {
		this.authMiddleware = new AuthMiddleware;
		this.initRoutes()
	}

	private initRoutes() {
		this.router.use(this.authMiddleware.verifyToken)
		this.router.get('/secret', this.home)
	}

	home(req: Request, res: Response) {
		res.send("thecsecret is cupcakes")
	}

}

export default ProtectedController;