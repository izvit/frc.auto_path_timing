import { json } from '@sveltejs/kit';
import { JSDOM } from 'jsdom';

export async function POST({ cookies, request }) {
    //-- Parse form
    const {eventName} = await request.json()
    
    //-- Fetch data
    const results = []
   
    let uri ="https://www.thebluealliance.com/event/" + eventName
    console.info("Fetching: " + uri)
    var matchTableHtml = await fetch(uri)
        .then(function(response) {
            return response.text()
        })
        .then(function(html) {
            const dom = new JSDOM(html);
            //console.log(dom.window.document.body.innerHTML)
            let matchTable =  dom.window.document.getElementById("qual-match-table")
            console.log("Match table len: " + matchTable.innerHTML.length)
            matchTableHtml = matchTable.outerHTML
            // for(let i=0; i<matchTable.rows.length; i++){
                
            // 	row = {
                    
            // 	}
            // }
            return matchTableHtml
        })
        .catch(function(err) {  
            console.log('Failed to fetch page: ', err);  
        });

        
    console.log("Returning response: " + matchTableHtml.length)
    return new Response( matchTableHtml, {status: 200} )

}