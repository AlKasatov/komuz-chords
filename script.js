(() => {

    const form = document.querySelector('.js-form')
    const dataRoot = document.querySelector('.js-data-root')

    if(!form || !dataRoot) return

    const FRETS_COUNT = 15
    const STRETCH_SIZE = 4
    const FRETS_DOTS = [2, 4, 5, 7, 9, 12]
    const scale = ['a', 'a#', 'b', 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#']
    const chordsStructure = {
        major: [0, 4, 7],
        minor: [0, 3, 7],
        sus2: [0, 2, 7],
        sus4: [0, 5, 7],
        major7: [0, 4, 10],
        minor7: [0, 3, 10],
    }

    form.addEventListener('change', changeFormHandler)
    changeFormHandler()

    function changeFormHandler(){
        const formData = new FormData(form);
        const data = {
            fretsCount: FRETS_COUNT,
            stretch: STRETCH_SIZE
        }
        formData.forEach((value, key) => {
            data[key] = value
        });
        renderData(processData(data))
    }

    function renderData(activeFretsDataArray) {
        dataRoot.innerHTML = ''
        const {
            data,
            tune
        } = activeFretsDataArray

        data.forEach(item => {
            const neck = document.createElement('div')
            neck.classList.add('neck')
            dataRoot.appendChild(neck)
            for (let i = 0; i < tune.length; i++) {
                let stringWrapper = document.createElement('div')
                stringWrapper.classList.add('string')
                neck.appendChild(stringWrapper)

                let stringName = document.createElement('div')
                stringName.classList.add('string-name')
                stringWrapper.appendChild(stringName)
                stringName.textContent = tune[i].toUpperCase()

                for (let k = 0; k <= FRETS_COUNT; k++) {
                    let fret = document.createElement('div')
                    fret.classList.add('fret')
                    stringWrapper.appendChild(fret)

                    if (FRETS_DOTS.includes(k)) {
                        fret.classList.add('dot')
                    }
                    if (k === 0) {
                        fret.classList.add('open')
                    }
                    if (k === item[i]) {
                        fret.classList.add('active')
                    }
                }
            }
        })
    }

    function findMatchFrets(scale, tune, fretCount, chord) {
        const matrix = []
        tune.forEach((item, index) => {
            matrix[index] = []
            const indexOfCurrentItem = scale.indexOf(item)
            for(let i = 0; i < fretCount; i++){
                const currentNote = scale[(i + indexOfCurrentItem) % scale.length]
                if (chord.includes(currentNote)) {
                    matrix[index].push({
                        [currentNote]: i
                    })
                }
            }
        })
        return matrix
    }

    function findAllCombinations(matrix) {
        function cartesian(result, item) {
            let newResult = []
            for (let i = 0; i < result.length; i++) {
                for (let k = 0; k < item.length; k++) {
                    newResult.push([...result[i], item[k]])
                }
            }
            return newResult
        }
        let result = [
            []
        ]
        matrix.forEach(item => {
            result = cartesian(result, item)
        })

        return result
    }

    function filterOnlyUniqNotesCombinations(combinations) {
        return combinations.filter(item => {
            const keysArr = item.map(item => Object.keys(item)[0])
            return keysArr.length === new Set(keysArr).size
        })
    }

    function filterComfortableStretchCombinations(combinations, stretch) {
        return combinations.filter(item => {
            const greaterNullValues = item.map(item => Object.values(item)[0]).filter(item => item > 0)
            if (greaterNullValues.length === 0) {
                return true
            }
            const {
                max,
                min
            } = greaterNullValues.reduce((acc, item) => {
                if (item >= acc.max) {
                    acc.max = item
                }
                if (item < acc.min) {
                    acc.min = item
                }
                return acc
            }, {
                max: greaterNullValues[0],
                min: greaterNullValues[0]
            })

            return (max - min + 1) <= stretch
        })
    }

    function getChord(rootNote, chordType) {
        const index = scale.indexOf(rootNote)
        return chordsStructure[chordType].map(item => scale[(index + item) % scale.length])
    }

    function processData(data) {
        const {
            fretsCount,
            stretch,
            chordType,
            instrumentTune,
            rootNote
        } = data
        const chord = getChord(rootNote, chordType)
        const tune = instrumentTune.split(',')
        const frets = findMatchFrets(scale, tune, fretsCount, chord)
        const allCombinations = findAllCombinations(frets)
        const filteredOnlyUniqNotesCombinations = filterOnlyUniqNotesCombinations(allCombinations)
        const filteredComfortableStretchCombinations = filterComfortableStretchCombinations(filteredOnlyUniqNotesCombinations, stretch)
        const readyData = filteredComfortableStretchCombinations.map(item => {
            return item.map(item => Object.values(item)[0])
        })
        return {
            data: readyData,
            tune
        }
    }

})()