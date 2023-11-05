export default function paramsCredentials() {
	let params = {
		"client_id": process.env.EXPO_PUBLIC_CLIENT_ID,
		"client_secret": process.env.EXPO_PUBLIC_CLIENT_SECRET,
	}
	
	return params;
}