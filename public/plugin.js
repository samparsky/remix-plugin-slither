
const extension = new window.RemixExtension()
let compileMsg = "<i class=\"fa fa-spinner fa-spin\"></i> Checking successful compilation"

function handleCompileFailure(error, analysisType) {
  document.querySelector('div#results').innerHTML = error;
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
    extension.call('compiler', 'getCompilationResult', [],function (error, result ) {
      console.log({result})
      console.log({error})
        if(result) {
          // handleCompileSuccess(result);
        }
        else{
          // handleCompileFailure(error);
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
