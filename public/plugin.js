
const extension = new window.RemixExtension()
let compileMsg = "<p class=\"text-center\" ><i class=\"fa fa-spinner fa-spin\"></i> Checking successful compilation</p>"
let global_err = []
let line = function(){
  console.log('sdagsas')
}

async function do_post(url, data, cb) {
  console.log(`host ${window.location.origin}`)
  const serverUrl  = `${window.location.origin}` + url
  try{
    const response =  await (await fetch(serverUrl, { method: 'POST', headers: { "Content-Type": "application/json; charset=utf-8"}, body: JSON.stringify(data)})).json();
    cb(response);
  }
  catch (error) {
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
  console.log({error})
  return function(index){
    console.log("working ofr Gord")
    index = parseInt(index)
    const item = error[index]
    const func = item['function'];
    const position = JSON.stringify({"start":{"line": (func['source_mapping']['lines'][0] == 0) ? 0 : (func['source_mapping']['lines'][0]-1) }, "end": {"line": func['source_mapping']['lines'][ func['source_mapping']['lines'].length - 1]} })
    extension.call('editor', 'highlight', [position, func['source_mapping']['filename'], "#f60"], function(err, result){
      console.log(err)
      console.log({result})
    })
  }
}

function displayError(error){

 const impact = {
    "suicidal": "high",
    "uninitialized-state": "high",
    "uninitialized-storage": "high",
    "arbitrary-send": "high",
    "controlled-delegatecall": "high",
    "reentrancy": "high",
    "locked-ether": "high",
    "constant-function": "high",
    "tx-origin": "medium",
    "uninitialized-local": "medium",
    "unused-return": "medium",
    "assembly": "informational",
    "constable-states": "informational",
    "external-function": "informational",
    "low-level-calls": "informational",
    "naming-convention": "informational",
    "pragma": "informational",
    "solc-version": "informational",
    "unused-state": "informational",
    "backdoor": "high",
  }

  const order = {
    "informational": 0,
    "medium": 1,
    "high": 2,
  }

  const color = {
    "high":          "alert-danger",
    "medium":        "alert-warning",
    "informational": "alert-info"
  }

  error = error.sort(function(x, y){
    if(order[impact[x.check]] < order[impact[y.check]]){
      return -1
    } else if (order[impact[x.check]] > order[impact[y.check]]){
      return 1
    }
    return 0
  })

  line = goToLine(error)

  var regex = /\/t/gi;
  const html = error.map((err, index)=>(
    `<div class="alert ${color[impact[err.check]]} onclick="line(${index})" alert-dismissible fade show" style="text-align: left!important" role="alert">
    <p onclick="line(${index})" style="font-size: 12px">${err.message}</p>
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
  } else {
    const { source, data} = result[0]
    do_post(`/analyze`, { disableDetectors, enableDetectors, source, data }, function(res) {
      console.log(res)
      let result
      if(res['error']){
        global_err = res['error']
        result = displayError(res['error'])
      } else {
        reult = `No issues`
      }
      document.querySelector('div#results').innerHTML = result;
    });
  }
  console.log(result)
}

const disableInput = (id) => $(id).attr("disabled", true)
const enableInput = (id) => $(id).attr("disabled", false)
const getValue = (id) => $(id).val()

function params(id){
  disableInput(id);
  return getValue(id);
}

window.onload = function () {
  extension.listen('compiler', 'compilationFinished', function () {
    console.log('compilation finished')
    console.log(arguments)
    bundle = $('#code').val();
    console.log({bundle})
  })

  document.querySelector('button#analyze').addEventListener('click', function () {
    goToLine()
    $('#collapseExample').collapse('hide');
    var div = document.querySelector('div#results');
    div.innerHTML = compileMsg;
    console.log("analyzing smart contract bugs")
    extension.call('compiler', 'getCompilationResult', [], function (error, result ) {
      console.log({result})
      console.log({error})
        if(result) {
          let disableDetectors = params('#disable-detectors')
          let enableDetectors = params('#enable-detectors')
          // let excludeFiles = params()
          console.log({disableDetectors})
          console.log({enableDetectors})
          handleCompileSuccess(disableDetectors, enableDetectors, result);

        } else{
          handleCompileFailure(error);
        }
    });
  });

}
