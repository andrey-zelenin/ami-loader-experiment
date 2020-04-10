window.addEventListener('load', function() {
  if (FILES_LIST.length === 0) {
    alert('No test files found');
  }

  // start animation for control loading process
  startAnimation(); 

  // add button handlers
  document.getElementById('btnLoadWithoutWorker').onclick = loadWithoutWorker;
  document.getElementById('btnLoadWithWorker').onclick = loadWithWorker;
});

const startAnimation = function(position) 
{
  if (position === undefined) {
    position = 0; // init value
  }

  position += 1;

  const train = document.querySelector('.train');
  train.style.width = '175px';
  train.style.position = 'fixed';
  train.style.left = position % window.innerWidth + 'px';
  document.getElementById('distance').textContent = position + ' m';

  requestAnimationFrame(() => startAnimation(position)); // animate
}

const loadWithoutWorker = function() 
{
  changeButtonsAvailability(true);

  new AMILoader(
    (loaded, total) => document.getElementById('progress').textContent = `(${loaded} / ${total})`,
    () => document.getElementById('parsing').textContent = 'parse with LOW FPS'
  ).load(FILES_LIST)
  .then(
    () => {  
      document.getElementById('result').textContent = 'done';
      changeButtonsAvailability(false); 
    }
  ).catch(
    error => { 
      document.getElementById('result').textContent = 'Error: ' + error;
      changeButtonsAvailability(false);
    }
  )
}

const loadWithWorker = function() 
{
  changeButtonsAvailability(true);

  new AMILoaderWorker(
    () => { setInfo('Done'); changeButtonsAvailability(false); },
    error => { setInfo('Error: ' + error); changeButtonsAvailability(false); },
    true,
    () => setInfo('Downloading files ...'),
    () => setInfo('Begin parse files ...'),
    () => setInfo('Parsing files [with HIGH FPS] ...')
  ).load(FILES_LIST);
}

const setInfo = function(text) 
{
  document.getElementById('result').textContent = text;
}

const changeButtonsAvailability = function(isDisabled) 
{
  document.getElementById('btnLoadWithoutWorker').disabled = isDisabled;
  document.getElementById('btnLoadWithWorker').disabled = isDisabled;
}