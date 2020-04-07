class AMILoader 
{
  constructor(downloadingFn = () => {},  parseBeginFn = () => {}) 
  {
    self.loader = new AMI.VolumeLoader(null, null);
    self.loader.on('load-start', function () {
      downloadingFn();
    });
    self.loader.on('parse-start', function () {
      parseBeginFn();
    });
  }

  load(links) 
  {
    let requests = new Map();

    return new Promise((resolve, reject) => {
      self.loader
        .load(links, requests)
        .then(() => {
          requests = null;
          let series,
              numberOfFiles = self.loader.data.length;

          if (numberOfFiles > 1) {
            series = self.loader.data[0];
            self.loader.data.shift();
            series = series.mergeSeries(self.loader.data);
          } else {
            series = self.loader.data;
          }

          self.loader.free();

          if (series.length > 1) {
            reject(new Error('Several series'));
          }

          resolve(series[0]);
        })
        .catch(error => reject(error));
    });
  }
}
