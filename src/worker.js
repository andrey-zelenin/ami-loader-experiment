// set env scope
self.window = self;

// import additional libraries
// IMPORTANT: change if needed for debug
importScripts(
  '/ami-loader-experiment/libs/three.min.js', // v.0.99
  '/ami-loader-experiment/libs/ami.min.js'    // EMSOW custom build
);

let loader;

const loadFiles = (links) => {
  let requests = new Map();

  return new Promise((resolve, reject) => {
    loader
      .load(links, requests)
      .then(() => {
        requests = null;

        let series,
            numberOfFiles = loader.data.length;

        if (numberOfFiles > 1) {
          series = loader.data[0];
          loader.data.shift();
          series = series.mergeSeries(loader.data);
        } else {
          series = loader.data;
        }

        loader.free();

        if (series.length > 1) {
          reject(new Error('Several series'));
        }
            
        resolve(series[0]);
      })
      .catch(error => reject(error));
  });
}

self.addEventListener('message', function messageListener(event) {
  loader = new AMI.VolumeLoader(null, null);
  loader.on('load-start', function () {
    self.postMessage({ type: 'downloading' });
  });
  loader.on('parse-start', function () {
    self.postMessage({ type: 'parseBegin' });
  });
  loader.on('parsing', function () {
    self.postMessage({ type: 'parsing' });
  });
  
  let promise = loadFiles(event.data.links);
  promise
    .then(value => {
      value._stack.forEach(i => {
        i.prepare();
        i.pack();
      });
  
      let transferList = [];
      value._stack.forEach(i => {
        i._rawData.forEach(o => {
          if (!transferList.includes(o.buffer)) {
            transferList.push(o.buffer);
          }
        });
        
        i._frame.forEach(o => {
          if (!transferList.includes(o._pixelData.buffer)) {
            transferList.push(o._pixelData.buffer);
          }
        });
      });

      // remove '_rawHeader', as it contains elements with type 'function'
      // see: https://developer.mozilla.org/ru/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
      delete(value._rawHeader); 

      self.postMessage({ type: 'result', value }, transferList);
    })
    .catch(error => self.postMessage({ type: 'error', value: error.stack }));
});
