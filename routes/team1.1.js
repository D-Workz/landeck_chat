var express = require('express');
var router = express.Router();


router.post("/", async (req, res, next) => {
  try {
    let queryResult = req.body.queryResult;
    if(Array.isArray(queryResult.parameters.name)){
      queryResult.parameters.name = queryResult.parameters.name[0];
    }
    let queryCondition = " ?sub ?pred ?obj .\n";
    let queryVariable = " "
    if(queryResult.action === "get_name" || queryResult.action === "welcome"){
      queryVariable = "*"
      queryCondition = "<https://www.team1.1.teaching.sti2.at> <http://schema.org/name> ?name1 .\n"+
       "<http://www.hotelwaldblick.com> <http://schema.org/name> ?name2 .\n"+
       "<https://team1.3.teaching.sti2.at> <http://schema.org/name> ?name3 .\n"+
       "<https://www.team1.4.teaching.sti2.at> <http://schema.org/email> ?name4 .\n"
    }
    if (queryResult.action === "get_contact" || queryResult.action === "get_description"){
      // let subj = "<https://www.team1.2.teaching.sti2.at>";
      let subj = "<http://www.hotelwaldblick.com>";
      if(queryResult.parameters.name.indexOf("SMG")!==-1){
        subj = "<https://www.team1.1.teaching.sti2.at>";
      }else if(queryResult.parameters.name==="Naturhotel BergRuhe"){
        subj = "<https://www.team1.4.teaching.sti2.at>";
      }else if(queryResult.parameters.name==="Luisa‘s Rooftop bar"){
        subj = "<https://team1.3.teaching.sti2.at>";
      }
      if (queryResult.action === "get_contact"){
        if(queryResult.parameters.name.indexOf("SMG")!==-1){
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

        }else if(queryResult.parameters.name==="Luisa‘s Rooftop bar"){
          queryVariable = "?time ?country ?locality ?postalCode ?streetAddress"
          queryCondition =  subj + " <http://schema.org/address> ?address ;\n" +
                                   " <http://schema.org/openingHours> ?time .\n" +
              "?address <http://schema.org/addressCountry> ?country ;\n" +
                      " <http://schema.org/addressLocality> ?locality ;\n" +
                      " <http://schema.org/postalCode> ?postalCode ;\n" +
                      " <http://schema.org/streetAddress> ?streetAddress .\n"
        }else if (queryResult.parameters.name==="Naturhotel BergRuhe"){
          queryVariable = "?time ?streetAddress"
          queryCondition =  subj + " <http://schema.org/address> ?address ;\n" +
              " <http://schema.org/openingHours> ?time .\n" +
              "?address <http://schema.org/streetAddress> ?streetAddress .\n"
        }else if (queryResult.parameters.name.indexOf("Wald")!==-1){
          queryVariable = "?location"
          queryCondition =  subj + " <http://schema.org/address> ?address .\n" +
              "?address <http://schema.org/addressStreet> ?location .\n"
        }
      }
      if (queryResult.action === "get_description"){
        queryVariable += " ?description"
        queryCondition =  subj + "<http://schema.org/description> ?description .\n"
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
       response = "Hi, willkommen im Chat von "+ result.results.bindings["0"]["name1"].value + ", " + result.results.bindings["0"]["name2"].value+ ", " + result.results.bindings["0"]["name3"].value + " und " + result.results.bindings["0"]["name4"].value
    }
    if(queryResult.action === "get_contact" ){
      if(queryResult.parameters.name.indexOf("SMG")!==-1 || queryResult.parameters.name.indexOf("Wald")!==-1) {
        if(queryResult.parameters.time !==""){
          response = "Geöffnet ist "+ result.results.bindings["0"].time.value
        }
        if(queryResult.parameters.location !==""){
          response = "Die Addresse ist "+ result.results.bindings["0"].location.value
        }
      }else if(queryResult.parameters.name==="Luisa‘s Rooftop bar"){
        response = "Die Addresse ist " + result.results.bindings["0"].streetAddress.value + ", " + result.results.bindings["0"]["postalCode"].value + ", " + result.results.bindings["0"]["locality"].value + "\n und geöffnet ist " + result.results.bindings["0"].time.value
      }else if(queryResult.parameters.name==="Naturhotel BergRuhe"){
        response = "Die Addresse ist " + result.results.bindings["0"].streetAddress.value + " und es ist " + result.results.bindings["0"].time.value
      }

    }
    if(queryResult.action === "get_description"){
      response = result.results.bindings["0"].description.value
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
