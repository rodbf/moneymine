const Discord = require("discord.js"); // imports the discord library
const fs = require("fs"); // imports the file io library

const client = new Discord.Client(); // creates a discord client
const token = fs.readFileSync("token.txt").toString(); // gets your token from the file
const pings = fs.readFileSync("pings.txt").toString(); // gets the notification recipients form the file

require('events').EventEmitter.defaultMaxListeners = 20;

client.once("ready", () => { // prints "Ready!" to the console once the bot is online
	console.log("Discord online");
});

const puppeteer = require('puppeteer')
let scrape = async (url, threshold) => {
	const browser = await puppeteer.launch({headless:true})
	const page = await browser.newPage()
	page.on('console', consoleObj => console.log(consoleObj.text()));
	await page.setDefaultNavigationTimeout(300000); 
	await page.setDefaultTimeout(300000);
	
	try{
		await page.goto(url);
	}catch(e){
		console.log(e.msg);
		browser.close();
		return "";
	}
	
	try{
		await page.waitForSelector('.price');
	}catch(e){
		console.log(e.msg);
		browser.close();
		return "";
	}
	const result = await page.evaluate((url, threshold) => {
		let axies = "";
		
		document.querySelectorAll('.price')
		.forEach((axie) => {
			let price = axie.textContent.split(' ')[1];
			if(price < threshold){
				if(axies == ""){
					axies = url + "\nThreshold: Ξ " + threshold + "\n";
				}
				axies += (price/threshold*100 - price/threshold*100%1)+ "%(Ξ " + price + ")\n";
			}
		});
		return axies;
	}, url, threshold);
	browser.close();
	return result;
}

async function main(args){
	scrape(args[0], args[1]).then((value) => {
		if(value.length == 0){
			console.log("nothing");
			return;
		}
		console.log(value);
		const channel = client.channels.cache.find(ch => ch.name === 'general');
			if (channel.isText()) {
				channel.send(pings+value)
			}
		return;
	})
	return;
}

async function fn(){
	params = [];
	let array = fs.readFileSync('urls.txt').toString().split('\n');
	for(let i = 0; i < array.length; i++){
		params.push(array[i].split('|'))
	}
	console.log(params.length);
	await Promise.all(params.map(async(args) => {
		main(args);
		return;
	}));
	return;
}

var minutes = 2, the_interval = minutes * 60 * 1000;
setInterval(function() {
	try{
		fn();
	}
	catch(err){
		console.log(err.message);
	}
}, the_interval);

client.login(token);