var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/webhook", async (req, res, next) => {
  try {
    // const sample_query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
    //     "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
    //     "SELECT * WHERE {\n" +
    //     "  ?sub ?pred ?obj .\n" +
    //     "} \n" +
    //     "LIMIT 10"

    // let sample_query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
    //     "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
    //     "SELECT * WHERE {\n" +
    //     "  <https://www.team1.1.teaching.sti2.at> <http://schema.org/name> ?obj .\n" +
    //     "} \n" +
    //     "LIMIT 10"
    //
    const sample_query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "SELECT * WHERE {\n" +
        "  <https://www.team1.1.teaching.sti2.at> <http://schema.org/name> ?obj .\n" +
        "} \n" +
        "LIMIT 10"

    let { query, infer } = req.body;
    infer = false;
    query = sample_query;
    let result;
    /* eslint-disable */
    result = await graphdb.Query.query(query, { infer });
    /* eslint-enable */
    result = JSON.parse(result.data.data);

    return res.json(
        {
          "fulfillmentText": "This is a text response",
          "source": "example.com",
          "payload": {
            "google": {
              "expectUserResponse": true,
              "richResponse": {
                "items": [
                  {
                    "simpleResponse": {
                      "textToSpeech": "this is a simple response"
                    }
                  }
                ]
              }
            },
            "facebook": {
              "text": "Hello, Facebook!"
            },
            "slack": {
              "text": "This is a text response for Slack."
            }
          }
        }
    );
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
