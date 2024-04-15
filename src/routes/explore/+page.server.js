import { match } from 'assert';

async function fetchEvent(eventName){
   
    return response
}

/** @type {import('./$types').Actions} */
export const actions = {
	getMatchInfo: async ({ cookies, request }) => {

		//-- Parse form
		const data = await request.formData();
		const eventName = data.get('eventName');
		
		//-- Fetch data
		let uri ="https://www.thebluealliance.com/event/" + eventName
		fetch(uri)
			.then(function(response) {
				return response.text()
			})
			.then(function(html) {
				var parser = new DOMParser();
				var document = parser.parseFromString(html, "text/html");
				var matchTable = document.getElementById("qual-match-table")
										 .getElementsByTagName('tbody');
				for(let i=0; i<matchTable.rows.length; i++){
					console.log(matchTable.rows[i].innerHTML);
				}

			})
			.catch(function(err) {  
				console.log('Failed to fetch page: ', err);  
			});






		
		
		DOMParser.parseFromString(info.body)
		
		console.log(info.statusText)
		return { json }
	}
};