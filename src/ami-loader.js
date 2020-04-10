class AMILoader 
{
  constructor(downloadingFn = (loaded, total) => {},  parseBeginFn = () => {}) 
  {
    this.downloadingFn = downloadingFn;
    this.parseBeginFn = parseBeginFn;    
    this.loader = new AMI.VolumeLoader(false, () => {
      return {
        update: (value, total, mode) => {
          if (mode === 'load') {
            this.downloadingFn(value, total);
            if (value / total === 1) {
              this.parseBeginFn();
            }
          }
        }
      };
    });
  }

  load(links) 
  {
    let requests = new Map();

    return new Promise((resolve, reject) => {
      this.loader
        .load(links, requests)
        .then(() => {
          requests = null;
          let series,
              numberOfFiles = this.loader.data.length;

          if (numberOfFiles > 1) {
            series = this.loader.data[0];
            this.loader.data.shift();
            series = series.mergeSeries(this.loader.data);
          } else {
            series = this.loader.data;
          }

          this.loader = null;

          if (series.length > 1) {
            reject(new Error('Several series'));
          }

          resolve(series[0]);
        })
        .catch(error => reject(error));
    });
  }
}
