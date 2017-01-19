var params = {
  inputStream: {
  type : 'LiveStream',
  constraints: {
      facingMode: 'user', // or user
      // width: {min: 640},
      // height: {min: 480},
      // aspectRatio: {min: 1, max: 100},
    },
  },
  locator: {
    patchSize: 'medium',
    halfSample: true,
  },
  numOfWorkers: 4,
  decoder: {
    readers : [{
      format: 'code_128_reader',
      config: {},
    }]
  },
  locate: true,
}

var App = {
  lastResult: null,

  init : function (params) {
    Quagga.init(params, (err) => {
      if (err) {
        console.log(err)
        return
      }
      Quagga.start()
    })

    setInterval(() => {
      this.amnesia()
    }, 5000)
  },

  clearCanvas: function () {
    var drawingCtx = Quagga.canvas.ctx.overlay
    var drawingCanvas = Quagga.canvas.dom.overlay

    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
  },

  amnesia: function () {
    this.clearCanvas()
    this.lastResult = null
  },

  onProcessed: function (result) {
    var drawingCtx = Quagga.canvas.ctx.overlay,
      drawingCanvas = Quagga.canvas.dom.overlay;

    if (result) {
      if (result.boxes) {
        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
        result.boxes.filter(function (box) {
          return box !== result.box;
        }).forEach(function (box) {
          Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: '#fc3100', lineWidth: 2});
        });
      }
    }
  },

  onDetected: function (result) {
    var code = result.codeResult.code;
    if (!isPrimeNumber(code)) return 
    if (this.lastResult === code) return 
    
    this.lastResult = code;

    if (!Store[code]) {
      var name = prompt('Имя:')
      if (name && name.length) {
        Store[code] = {
          name: name,
          visits: [],
        }
      }
    } else {
      var now = new Date()
      Store[code].visits.push(now.toLocaleString())
    }

    var log = document.querySelector('.log')
    
    log.innerHTML = `
      [${Store[code].visits.length}] ${Store[code].name}<br>
    ` + log.innerHTML
  }
};

function isPrimeNumber (code) {
  // Проверить число на простоту, чтобы не было ложных срабатываний
  return true
}

var Store = {}

App.init(params)
Quagga.onProcessed(App.onProcessed.bind(App))
Quagga.onDetected(App.onDetected.bind(App))
