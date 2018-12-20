
const extension = new window.RemixExtension()

const helpers = {
  "disableInput": (id) => $(id).attr("disabled", true),
  "enableInput": (id) => $(id).attr("disabled", false),
  "display":  (id, html) => document.querySelector(`${id}`).innerHTML = html,

  "get": async function (url, cb){
    const serverUrl  = `${window.location.origin}` + url
    try {
      const response =  await ( await fetch( 
                      serverUrl, { 
                        method: 'GET', 
                        headers: { "Content-Type": "application/json; charset=utf-8"},
                      }
                    )
                  ).json();
      cb(response);
    } catch (error) {
      console.log(error)
    }
  },
  "post": async function (url, data, cb) {
    const serverUrl  = `${window.location.origin}` + url
    try {
      const response =  await ( await fetch( 
                      serverUrl, { 
                        method: 'POST', 
                        headers: { "Content-Type": "application/json; charset=utf-8"},
                        body: JSON.stringify(data)
                      }
                    )
                  ).json();
      cb(response);
    } catch (error) {
      console.log({error})
      let div = document.querySelector('div#results');
      div.innerHTML = compileMsg(3);
    } 
  },

  "sortError": function (error){
    const order = {
      "Informational": 0,
      "Low": 1,
      "Medium": 2,
      "High": 3,
    }
  
    return error.sort(function(x, y) {
      if(order[x.impact] < order[y.impact]){
        return -1
      } else if (order[x.impact] > order[y.impact]) {
        return 1
      }
      return 0
    })
  },
  
}

const compileMsg = function(type, filename){
  switch(type){
    case 1:
      return `<p class=\"text-center\" >
              <i class=\"fa fa-spinner fa-spin\"></i> Loading files...
              </p>`
    case 2:
      return `<p class=\"text-center\" >
              <i class=\"fa fa-spinner fa-spin\"></i> 
              Analyzing <strong>${filename}</strong> ...
              </p>`
    case 3:
      return `<p class=\"text-center text-danger\" >
      <i class=\"fa fa-warning\"></i> 
      Failed to connect to server ...
      </p>`
    default:
      return ""
  }
}

function handleCompileFailure(error) {
  html = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Compilation Failed!</strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>`

  document.querySelector('div#results').innerHTML = error || html;
}

function addCheckbox(item) {
  const { check, wiki, description } = item
  const html = `
    <div class="detectors form-check">
      <input class="form-check-input" type="checkbox" checked value="${check}" id="${check}">
      <label class="form-check-label" for="${check}">
       <a target="_blank" href="${wiki}">${description}</a>
      </label>
    </div>
  `
  return html
}

function getDetectors() {
  let detectors = $(".detectors input:checkbox:checked").map(function(){
    return `${$(this).val()}`;
  }).get();
  detectors = detectors.reduce((total, item) => `${total},${item}`)
  return detectors
}

function displayDetectors(detectors) {
  const highDetectors          = (detectors.filter((item) => item['impact'] == "High"))
                                  .map(addCheckbox)
                                  .reduce((total, item) => `${total} ${item}`)

  const mediumDetectors        = (detectors.filter((item) => item['impact'] == "Medium"))
                                  .map(addCheckbox)
                                  .reduce((total, item) => `${total} ${item}`)

  const lowDetectors           = (detectors.filter((item) => item['impact'] == "Low"))
                                  .map(addCheckbox)
                                  .reduce((total, item) => `${total} ${item}`)

  const informationalDetectors = (detectors.filter((item) => item['impact'] == "Informational"))
                                  .map(addCheckbox)
                                  .reduce((total, item) => `${total} ${item}`)

  helpers.display('div#high', highDetectors)
  helpers.display('div#medium', mediumDetectors)
  helpers.display('div#low', lowDetectors)
  helpers.display('div#informational', informationalDetectors)
}

function goToLine(func){
    const position = JSON.stringify(
      { "start": {
        "line": 
          (func['source_mapping']['lines'][0] == 0) ? 0 : (func['source_mapping']['lines'][0]-1) 
        }, 
        "end": {
          "line": func['source_mapping']['lines'][ func['source_mapping']['lines'].length - 1]} 
        }
    )

    extension.call(
      'editor', 
      'highlight', 
      [position, func['source_mapping']['filename'], "hsla(202, 91%, 75%, 1)"], 
      function(err, result){
      }
    )

    return false;
}


function getMessage(errorClass, funcParam, desc){
  function template(strings, errorClass, funcParam, desc){
    const [ str0, str1, str2, str3 ] = strings;
    return `${str0}${errorClass}${str1}${funcParam}${str2}${desc}${str3}`
  }

  return template`
  <div class="alert ${errorClass} alert-dismissible fade show" 
    style="text-align: left!important" role="alert">
  <a href="#" onclick='return goToLine(${JSON.stringify(funcParam)})' style="font-size: 12px">${desc}</a>
  <button  type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  </div>`
}


function formatError(error){
  const color = {
    "High":          "alert-danger",
    "Medium":        "alert-warning",
    "Informational": "alert-success",
    "Low":           "alert-info",
  }

  const sortedError = helpers.sortError(error)

  const html = sortedError.map((err, index) => {
    const item      = sortedError[index]
    const errColor  = color[err['impact']]
    let description = err['description']

    if(item['check'] == "unused-state"){
      let elements     = item['elements']   
      let descriptions = description.split("\n ")

      if(descriptions.length == 1) {
        let func    = elements[0]
        description = getMessage(errColor, func, description)
      } else {
        descriptions = descriptions.map((desc, index) => {
          let func = elements[index]
          return getMessage(errColor, func, desc)
        })
        description = descriptions.reduce((total, item) => `${total} ${item}`)
      }
    } else {
      let func = item['elements'][0]
      description = getMessage(errColor, func, description)
    }

    return description
  })

  return html.reduce((total, item) => `${total} ${item}`)
}

function handleCompileSuccess(detectors, result) {
  if(result[0] == null){
    html = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Compilation Failed!</strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>`

    document.querySelector('div#results').innerHTML = html;
    return
  }

  const { source, data } = result[0]

  helpers.post(`/analyze`, { detectors, source, data }, function(res) {
    let result

    if(!res['output']) {
      if(typeof res['error'] == "string") {
        result = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>${res['error']}</strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>`
      
      } else {
        result = formatError(res['error'])
        let heading       = document.querySelector('div#heading');
        heading.innerHTML = `<h6>Result: ${source['target']}</h6>`
      }

    } else {
      result = `<div class="alert alert-info alert-dismissible fade show" role="alert">
        <strong>Success! No issues found</strong>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`
    }
    
    document.querySelector('div#results').innerHTML = result;
  });

}

window.onload = async function () {

  extension.listen('compiler', 'compilationFinished', function () {
    extension.call(
      'editor', 
      'discardHighlight', 
      [],
      function(err){
      }
    )
  })
  
  helpers.disableInput("#analyze")
  // get detectors
  await helpers.get("/detectors", function(response) {
    if(response['output']){
      response = JSON.parse(response['output'])
      displayDetectors(response)
    }
  })
  helpers.enableInput("#analyze")

  document.querySelector('button#analyze').addEventListener('click', function () {
    helpers.disableInput("#analyze")
    $('#collapseExample').collapse('hide');

    const detectors = getDetectors()
    let div       = document.querySelector('div#results');
    div.innerHTML = compileMsg(1);

    extension.call('compiler', 'getCompilationResult', [], function (error, result ) {      
      if(result[0]) {
        const filename       = result[0]['source']['target'];
        div.innerHTML        = compileMsg(2, filename);
        handleCompileSuccess(detectors, result);
      } else {
        handleCompileFailure(error);
      }

      helpers.enableInput("#analyze")
    });
  });

}
