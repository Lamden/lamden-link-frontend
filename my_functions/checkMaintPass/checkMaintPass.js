exports.handler = async (event) => {
	const { password } = event.queryStringParameters
	console.log(process.env.MAINT_PASS)
	console.log(process.env)
	if (password === process.env.MAINT_PASS){
		return {
			statusCode: 200,
			body: JSON.stringify({ valid: true })
		};
	}else{
		return {
			statusCode: 200,
			body: JSON.stringify({ valid: false })
		};
	}
};