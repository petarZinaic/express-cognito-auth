import AWS from 'aws-sdk';
import crypto from 'crypto';

class CognitoService {
	private config = {
		region: 'eu-north-1'
	}
	private secretHash: string = 'ar5jtm4mi22um48sc6svc7egnv98urlirvu8crnd2sbg3msa4q6';
	private clientId: string = '7vql04u7mnd8oha054qfnd4i75';

	private cognitoIndentity;

	constructor() {
		this.cognitoIndentity = new AWS.CognitoIdentityServiceProvider(this.config);
	}

	public async signUpUser(username: string, password: string, userAttr: Array<any>): Promise<boolean> {
		const params = {
			ClientId: this.clientId,
			Password: password,
			Username: username,
			SecretHash: this.generateHash(username),
			UserAttributes: userAttr
		}

		try {
			const data = await this.cognitoIndentity.signUp(params).promise();
			console.log(data);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	public async verifyAccount(username: string, code: string): Promise<boolean> {
		const params = {
			ClientId: this.clientId,
			ConfirmationCode: code,
			SecretHash: this.generateHash(username),
			Username: username,
		}

		try {
			const data = await this.cognitoIndentity.confirmSignUp(params).promise();
			console.log(data);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	public async signInUser(username: string, password: string): Promise<boolean> {
		const params = {
			AuthFlow: 'USER_PASSWORD_AUTH',
			ClientId: this.clientId,
			AuthParameters: {
				'USERNAME': username,
				'PASSWORD': password,
				'SECRET_HASH': this.generateHash(username)
			}
		}

		try {
			const data = this.cognitoIndentity.initiateAuth(params).promise();
			console.log(data);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	private generateHash(username: string): string {
		return crypto.createHmac('SHA256', this.secretHash)
			.update(username + this.clientId)
			.digest('base64')
	}

}

export default CognitoService;
