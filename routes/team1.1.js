var express = require('express');
var router = express.Router();


router.post("/", async (req, res, next) => {
  try {
    const queryResult = req.body.queryResult;
    let queryCondition = " ?sub ?pred ?obj .\n";
    let queryVariable = " "
    if(queryResult.action === "get_name" || queryResult.action === "welcome"){
      queryVariable = "?name"
      queryCondition = "<https://www.team1.1.teaching.sti2.at> <http://schema.org/name> ?name .\n"
    }
    if (queryResult.action === "get_contact"){
      // let subj = "<https://www.team1.2.teaching.sti2.at>";
      let subj = "<http://www.hotelwaldblick.com>";
      if(queryResult.parameters.name.indexOf("SMG")!==-1){
        subj = "<https://www.team1.1.teaching.sti2.at>";
      }else if(queryResult.parameters.name==="Naturhotel BergRuhe"){
        subj = "<https://www.team1.4.teaching.sti2.at>";
      }else if(queryResult.parameters.name==="Luisa‘s Rooftop bar"){
        subj = "<https://team1.3.teaching.sti2.at>";
      }
      if(queryResult.parameters.time !==""){
        queryVariable = "?time"
        queryCondition =  subj + " <http://schema.org/openingHoursSpecification> ?openingHoursSpecification .\n" +
            "?openingHoursSpecification <http://schema.org/opens> ?time ."
      }
      if(queryResult.parameters.location !==""){
        queryVariable += " ?location"
        queryCondition =  subj + " <http://schema.org/address> ?address .\n" +
            "?address <http://schema.org/addressCountry> ?location ."
      }
    }

    const sample_query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "SELECT "+ queryVariable + " WHERE {\n" +
        queryCondition + "}"

    const infer = false;
    const query = sample_query;
    let result;
    /* eslint-disable */
    result = await graphdb.Query.query(query, { infer });
    /* eslint-enable */
    result = JSON.parse(result.data.data);

    let response = "Sorry, habe nix gefunden.";
    if(queryResult.action === "get_name" || queryResult.action === "welcome"){
       response = "Hi, willkommen im Chat von "+ result.results.bindings["0"].name.value
    }
    if(queryResult.action === "get_contact" ){
      if(queryResult.parameters.time !==""){
        response = "Es hat geöffnet um: "+ result.results.bindings["0"].time.value
      }
      if(queryResult.parameters.location !==""){
        response = "Du findest es: "+ result.results.bindings["0"].location.value
      }
    }
    return res.json(
        {
          "fulfillmentText": response,
          "fulfillmentMessages": []
        }
    );
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
