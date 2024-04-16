import { json } from '@sveltejs/kit';
import { JSDOM } from 'jsdom';

function getFirstLink(elem, prefix) {
    let vidLinks =elem.getElementsByTagName("a")
    let vidLink = null
    if (vidLinks.length > 0) 
        vidLink = vidLinks[0].getAttribute("href")
        if (!vidLink.startsWith(prefix))
            return null
        return vidLinks[0]
    return null
}

export async function POST({ cookies, request }) {
    //-- Parse form
    const {eventName} = await request.json()
    
    //-- Fetch data
    const results = []
   
    let uri ="https://www.thebluealliance.com/event/" + eventName
    console.info("Fetching: " + uri)
    var resultsArr = await fetch(uri)
        .then(function(response) {
            return response.text()
        })
        .then(function(html) {
            const dom = new JSDOM(html);
            //console.log(dom.window.document.body.innerHTML)
            let matchTable =  dom.window.document.getElementById("qual-match-table")
            console.log("Match table len: " + matchTable.innerHTML.length)

            const resultsArr = []
            let tbody = matchTable.getElementsByTagName("tbody")[0];
            let rows = tbody.getElementsByClassName("visible-lg")
            for(let i=0; i<rows.length; i++){
                console.log("link" + getFirstLink(rows[i].cells[2], "/team").text)
                resultsArr.push({
                    "videoUrl" :  getFirstLink(rows[i].cells[0], "/match")?.getAttribute("href"),
                    "red0" :  { number : getFirstLink(rows[i].cells[2], "/team")?.text,
                    uri :    getFirstLink(rows[i].cells[2], "/team")?.getAttribute("href")
                    },
                    "red1" :  { number : getFirstLink(rows[i].cells[3], "/team")?.text,
                    uri :    getFirstLink(rows[i].cells[3], "/team")?.getAttribute("href")
                    },
                    "red2" :  { number : getFirstLink(rows[i].cells[4], "/team")?.text,
                    uri :    getFirstLink(rows[i].cells[4], "/team")?.getAttribute("href")
                    },
                    "blue0" :  { number : getFirstLink(rows[i].cells[5], "/team")?.text,
                    uri :    getFirstLink(rows[i].cells[5], "/team")?.getAttribute("href")
                    },
                    "blue1" :  { number : getFirstLink(rows[i].cells[6], "/team")?.text,
                    uri :    getFirstLink(rows[i].cells[6], "/team")?.getAttribute("href")
                    },
                    "blue2" :  { number : getFirstLink(rows[i].cells[7], "/team")?.text,
                    uri :    getFirstLink(rows[i].cells[7], "/team")?.getAttribute("href")
                    }
                })
            }

            return resultsArr
        })
        .catch(function(err) {  
            console.log('Failed to fetch page: ', err);  
        });

    FileSystemWritableFileStream  
    console.log("Returning rows: " + resultsArr.length)
    return new Response( JSON.stringify(resultsArr), 
                        {
                            status: 200,
                            headers: new Headers({
                                "content-type": "application/json",
                            }),
                        })

}