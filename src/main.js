window.addEventListener('load', function() {
  if (FILES_LIST.length === 0) {
    alert('No test files found');
  }

  // start animation for control loading process
  startAnimation(); 
  showTime();

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
    (loaded, total) => document.getElementById('downloading').textContent = `(${loaded} / ${total})`,
    () => document.getElementById('parsing').textContent = 'parse with LOW FPS'
  ).load(FILES_LIST)
  .then(
    () => {  
      document.getElementById('result').textContent = 'done';
      changeButtonsAvailability(false); 
    }
  ).catch(
    error => { 
      document.getElementById('result').textContent = 'error: ' + error;
      changeButtonsAvailability(false);
    }
  )
}

const loadWithWorker = function() 
{
  changeButtonsAvailability(true);

  new AMILoaderWorker(
    () => { 
      document.getElementById('result').textContent = 'done'; 
      changeButtonsAvailability(false);
    },
    error => {
      document.getElementById('result').textContent = 'error: ' + error;; 
      changeButtonsAvailability(false); 
    },
    true,
    (loaded, total) => document.getElementById('downloading').textContent = `(${loaded} / ${total})`,
    () => document.getElementById('parsing').textContent = 'parse with HIGH FPS',
    (parsed, total) => document.getElementById('parsing').textContent = `(${parsed} / ${total})`
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

const showTime = function()
{
  let date = new Date(),
      h = date.getHours();   // 0 - 23
      m = date.getMinutes(); // 0 - 59
      s = date.getSeconds(); // 0 - 59
      session = 'AM';
  
  if (h == 0) {
      h = 12;
  }
  
  if (h > 12) {
      h = h - 12;
      session = 'PM';
  }
  
  h = (h < 10) ? '0' + h : h;
  m = (m < 10) ? '0' + m : m;
  s = (s < 10) ? '0' + s : s;
  
  let time = h + ':' + m + ':' + s + ' ' + session;

  document.getElementById('clock').innerText = time;
  document.getElementById('clock').textContent = time;
  
  setTimeout(showTime, 1000);
}