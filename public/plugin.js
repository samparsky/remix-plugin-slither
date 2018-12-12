
const extension = new window.RemixExtension()

let line = function(){}

const disableInput = (id) => $(id).attr("disabled", true)
const enableInput = (id) => $(id).attr("disabled", false)
const getValue = (id) => $(id).val()

function params(id){
  disableInput(id);
  return getValue(id);
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
    default:
      return ""
  }
}


async function post(url, data, cb) {
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
    console.log(error);
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


function goToLine(error){

  return function(index){
    event.preventDefault();

    index = parseInt(index)
    const func = error[index]['function'];

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

  }
}

function formatError(error){

  const order = {
    "Informational": 0,
    "Medium": 1,
    "High": 2,
  }

  const color = {
    "High":          "alert-danger",
    "Medium":        "alert-warning",
    "Informational": "alert-info"
  }

  error = error.sort( function(x, y) {
    if(order[x.impact] < order[y.impact]){
      return -1
    } else if (order[x.impact] > order[y.impact]) {
      return 1
    }
    return 0
  })

  line = goToLine(error)

  const html = error.map((err, index)=>(
    `<div class="alert ${color[err.impact]} onclick="line(${index})"
      alert-dismissible fade show" style="text-align: left!important" role="alert">
    <a href="#" onclick="line(${index})" style="font-size: 12px">${err.description}</a>
    <button  type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>`
  ))

  return html.reduce((total, item) => `${total} ${item}`)
}

function handleCompileSuccess(disableDetectors, enableDetectors, result) {
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

  const { source, data} = result[0]

  post(`/analyze`, { disableDetectors, enableDetectors, source, data }, function(res) {
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
        let heading = document.querySelector('div#heading');
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

window.onload = function () {

  document.querySelector('button#analyze').addEventListener('click', function () {
    
    disableInput("#analyze")
    $('#collapseExample').collapse('hide');

    let div = document.querySelector('div#results');
    div.innerHTML = compileMsg(1);

    extension.call('compiler', 'getCompilationResult', [], function (error, result ) {
      if(result[0]) {
        const filename = result[0]['source']['target'];
        let disableDetectors = params('#disable-detectors')
        let enableDetectors = params('#enable-detectors')

        div.innerHTML = compileMsg(2, filename);

        handleCompileSuccess(disableDetectors, enableDetectors, result);
      } else {
        handleCompileFailure(error);
      }

      enableInput("#analyze")
      enableInput('#enable-detectors')
      enableInput('#disable-detectors')
    });
  });

}
