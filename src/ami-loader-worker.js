class AMILoaderWorker 
{
  constructor(
    resultFn = result => {},
    errorFn = error => {},
    closeWhenLoaded = true,
    downloadingFn = () => {},
    parseBeginFn = () => {},
    parsingFn = () => {}
  ) {
    // see: https://developer.mozilla.org/ru/docs/Web/API/Web_Workers_API
    //      https://developer.mozilla.org/ru/docs/DOM/Using_web_workers
    //      https://www.html5rocks.com/en/tutorials/workers/basics/
    if (window.Worker) {
      // IMPORTANT: change if needed for debug
      self.wk = new Worker('/ami-loader-experiment/src/worker.js');
    } else {
      alert('Your browser doesn\'t support web workers');
    }

    self.wk.onmessage = ({ data }) => {
      switch (data.type) {
        case 'downloading':
          downloadingFn();
          break;
        case 'parseBegin':
          parseBeginFn();
          break;
        case 'parsing':
          parsingFn();
          break;
        case 'result':
          (() => {            
            let result = new AMI.SeriesModel();

            result._stack = AMILoaderWorker.createStackModel(data.value._stack);
            delete data.value._stack;

            for (let k in data.value) {
              result[k] = data.value[k];
            }
            
            resultFn(result);
            if (closeWhenLoaded) {
              self.wk.terminate();
            }
          })();
          break;
        case 'error':
          errorFn(data.value);

          self.wk.terminate();
          break;
      }
      self.wk.onerror = ({ data }) => {
        errorFn(data);

        self.wk.terminate();
      };
    };
  }

  load(links) 
  {
    self.wk.postMessage({ links });
  }

  terminate() 
  {
    self.wk.terminate();
  }

  static createStackModel(data) 
  {
    let result = [];

    data.forEach(i => {
      let stack = new AMI.StackModel();
      stack._aabb2LPS = new THREE.Matrix4();
      stack._dimensionsIJK = new THREE.Vector3();
      stack._halfDimensionsIJK = new THREE.Vector3();
      stack._ijk2LPS = new THREE.Matrix4();
      stack._lps2AABB = new THREE.Matrix4();
      stack._lps2IJK = new THREE.Matrix4();
      stack._origin = new THREE.Vector3();
      stack._regMatrix = new THREE.Matrix4();
      stack._spacing = new THREE.Vector3();
      stack._xCosine = new THREE.Vector3();
      stack._yCosine = new THREE.Vector3();
      stack._zCosine = new THREE.Vector3();

      stack._frame = AMILoaderWorker.createFrameModel(i._frame);
      delete i._frame;
      stack._rawDataFromOtherStack = i._rawDataFromOtherStack;
      delete i._rawDataFromOtherStack;

      for (let k in i) {
        stack[k] = typeof i[k] === 'object' 
        ? AMILoaderWorker.copyObject(stack[k], i[k]) 
        : i[k];
      }

      result.push(stack);
    });

    return result;
  }

  static createFrameModel(data) 
  {
    let result = [];

    data.forEach(i => {
      let item = new AMI.FrameModel();
      for (let k in i) {
        item[k] = i[k];
      }

      result.push(item);
    });
    
    return result;
  }

  static copyObject(result, source) 
  {
    for (let key in source) {
      result[key] = source[key];
    }

    return result;
  }
}