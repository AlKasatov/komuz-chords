const worker = new Worker('worker.js');

const FRETS_COUNT = 15
const STRETCH_SIZE = 4
const FRETS_DOTS = [2,4,5,7,9,12]
const processData = async (data) => new Promise((resolve, reject) => {
    worker.postMessage(data)
    worker.onmessage = function(event) {
        resolve(event.data)
    };
    worker.onerror = function(error) {
        reject(error)
    };
})

const form = document.querySelector('.js-form')
const dataRoot = document.querySelector('.js-data-root')

if(form && dataRoot){
    const changeFormHandler = () => {
        form.classList.add('disabled')
        const formData = new FormData(form);
        const data = {
            fretsCount: FRETS_COUNT,
            stretch: STRETCH_SIZE
        }
        formData.forEach((value, key) => {
           data[key] = value
        });
        processData(data).then((result) => {
            renderData(result)
        }).catch((er) => {
            console.log(er)
        }).finally(() => {
            form.classList.remove('disabled')
        })
    }

    form.addEventListener('change', changeFormHandler)
    changeFormHandler()
}


function renderData(activeFretsDataArray){
    const {data, tune} = activeFretsDataArray

    data.forEach(item => {

        const neck = document.createElement('div')
        neck.classList.add('neck')
        dataRoot.appendChild(neck)
        let currentResult = ''
        for(let i = 0; i < tune.length; i++){
            let stringWrapper = document.createElement('div')
            stringWrapper.classList.add('string')
            neck.appendChild(stringWrapper)

            let stringName = document.createElement('div')
            stringName.classList.add('string-name')
            stringWrapper.appendChild(stringName)
            stringName.textContent = tune[i].toUpperCase()
            for(let k = 0; k <= FRETS_COUNT; k++){
                let fret = document.createElement('div')
                fret.classList.add('fret')
                stringWrapper.appendChild(fret)
                if(FRETS_DOTS.includes(k)){
                    fret.classList.add('dot')
                }
                if(k === 0){
                    fret.classList.add('open')
                }
                if(k === item[i]){
                    fret.classList.add('active')
                }
            }
        }
    })

}