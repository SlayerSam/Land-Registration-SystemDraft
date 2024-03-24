const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator')
const OTP = require('../models/OtpModel.cjs')
const { walletaddr, contract } = require('../utils/contract.cjs')
const { heliaFs } = require('../utils/heliaNode.cjs')

exports.addLand = async (req, resp) => {
	const { area, state, district, email, propertyid, survey, price } = JSON.parse(req.body.data)
	const files = req.files.map((item, index) => (
		item.filename
	))
	console.log(files, req.files)
	try {
		const address = state + ' , ' + district
		const tx = await contract.methods.addLand(parseInt(area, 10), address, propertyid, survey, parseInt(price, 10), files, Date.now().toString()).send({ from: walletaddr })
		if (tx) {
			resp.status(200).send({ success: true, message: 'land registered' })
		}
	}
	catch (e) {
		console.log(e)
		resp.status(500).send({ success: false, message: 'Server Not Responding' })
	}


}
exports.getland = async (req, resp) => {
	const tx = await contract.methods.getMyLands(walletaddr).call()
	if (tx) {
		console.log(tx)
		for (let i of tx) {
			for (key in i) {
				try {
					if (BigInt(i[key]) === i[key]) {
						i[key] = Number(i[key])
					}
				}
				catch (e) {
				}
			}
		}
		resp.status(200).send({ success: true, data: tx })
	}
}
exports.getAllLands = async (req, resp) => {
	const tx = await contract.methods.getAllLands(walletaddr).call()
	if (tx) {
		for (var i in tx) {
			for (let key in tx[i]) {
				try {
					if (BigInt(tx[i][key]) === tx[i][key]) {
						tx[i][key] = Number(tx[i][key])
					}
				}
				catch (e) {
				}
			}
		}
		resp.status(200).send({ success: true, data: tx })
	}
}
exports.sellland = async (req, resp) => {
	const { objId } = req.body;
	try {
		const tx = await contract.methods.sellReq(walletaddr, parseInt(objId, 10)).send({ from: walletaddr })
		if (tx) {
			resp.status(201).send({ success: true, message: 'land selled' })
		}
	}
	catch (e) {
		console.log(e)
		resp.status(500).send({ success: false, message: 'server not responding' })
	}
}
exports.buyland = async (req, resp) => {
	const { owner } = req.body;
	try {
		const tx = await contract.methods.buyReq(walletaddr, owner).send({ from: walletaddr })
		if (tx) {
			resp.status(201).send({ success: true, message: 'land purchased' })
		}
	}
	catch (e) {
		console.log(e)
		resp.status(500).send({ success: false, message: 'server not responding' })
	}
}


//admin queries
exports.buyReq = async (req, resp) => {
	try {
		const tx = await contract.methods.getBuyRequest().call()
		if (tx) {
			for (var i in tx) {
				for (let key in tx[i]) {
					try {
						if (BigInt(tx[i][key]) === tx[i][key]) {
							tx[i][key] = Number(tx[i][key])
						}
					}
					catch (e) {
					}
				}
			}
			resp.status(201).send({ success: true, data: tx })
		}
	}
	catch (e) {
		console.log(e)
		resp.status(500).send({ success: false, message: 'server not responding' })
	}
}
exports.registerreq = async (req, resp) => {
	try {
		const tx = await contract.methods.getSellRequest().call();
		console.log(tx)
		if (tx) {
			for (var i in tx) {
				for (let key in tx[i]) {
					try {
						if (BigInt(tx[i][key]) === tx[i][key]) {
							tx[i][key] = Number(tx[i][key])
						}
					}
					catch (e) {
					}
				}
			}
			resp.status(201).send({ success: true, data: tx })
		}
	}
	catch (e) {
		console.log(e)
		resp.status(500).send({ success: false, message: 'server not responding' })
	}
}
exports.registeraccept = async (req, resp) => {
	const { id } = req.body;
	try {
		const tx = await contract.methods.acceptReg(walletaddr, parseInt(id, 10)).send({ from: walletaddr })
		if (tx)
			resp.status(201).send({ success: true })
	}
	catch (e) {
		resp.status(500).send({ success: false, message: 'server not responding' })
	}
}
exports.buyaccept = async (req, resp) => {
	const { objId, owner } = req.body;
	try {
		const tx = await contract.methods.acceptBuy(walletaddr, owner, parseInt(objId, 10)).call()
		if (response) {
			resp.status(201).send({ success: true })
		}
	}
	catch (e) {
		resp.status(500).send({ success: false, message: 'server not responding' })
	}
}


exports.reject = async (req, resp) => {
	const { id } = req.body;
	try {
		const tx = await contract.methods.rejectReg(parseInt(id, 10)).call()
		if (tx)
			resp.status(201).send({ success: true })
	}
	catch (e) {
		resp.status(500).send({ success: false, message: 'server not responding' })
	}
}
exports.buyerrej = async (req, resp) => {
	const { id } = req.body;
	try {
		const tx = await contract.methods.rejectBuy(parseInt(id, 10)).call()
		if (tx)
			resp.status(201).send({ success: true })
	}
	catch (e) {
		resp.status(500).send({ success: false, message: 'server not responding' })
	}
}