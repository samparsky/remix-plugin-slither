
const extension = new window.RemixExtension()
let compileMsg = "<i class=\"fa fa-spinner fa-spin\"></i> Checking successful compilation"

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

  const color = {
    "high":          "alert-danger",
    "medium":        "alert-warning",
    "informational": "alert-info"
  }

  const html = error.map((err)=>(
    `<div class="alert ${color[impact[err.check]]} alert-dismissible fade show" role="alert">
    <strong>${err.message}!</strong>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
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

  // setInterval(function () {
  //   extension.call('app', 'detectNetWork', [], function (error, result) {
  //     console.log(error, result)
  //   })
  // }, 5000)

  // document.querySelector('input#testmessageadd').addEventListener('click', function () {
  //   extension.call('config', 'setConfig', [document.getElementById('filename').value, document.getElementById('valuetosend').value],
  //   function (error, result) { console.log(error, result) })
  // })

  // document.querySelector('input#testmessageremove').addEventListener('click', function () {
  //   extension.call('config', 'removeConfig', [document.getElementById('filename').value],
  //   function (error, result) { console.log(error, result) })
  // })

  // document.querySelector('input#testmessagerget').addEventListener('click', function () {
  //   extension.call('config', 'getConfig', [document.getElementById('filename').value],
  //   function (error, result) { console.log(error, result) })
  // })

  // document.querySelector('input#testcontractcreation').addEventListener('click', function () {
  //   extension.call('udapp', 'runTx', [addrResolverTx],
  //   function (error, result) { console.log(error, result) })
  // })

  // document.querySelector('input#testaccountcreation').addEventListener('click', function () {
  //   extension.call('udapp', 'createVMAccount', ['71975fbf7fe448e004ac7ae54cad0a383c3906055a75468714156a07385e96ce', '0x56BC75E2D63100000'],
  //   function (error, result) { console.log(error, result) })
  // })

  // var k = 0
  // document.querySelector('input#testchangetitle').addEventListener('click', function () {
  //   extension.call('app', 'updateTitle', ['changed title ' + k++],
  //   function (error, result) { console.log(error, result) })
  // })
}
