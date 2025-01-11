

const scale = ['a', 'a#', 'b', 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#']


function findMatchFrets(scale, tune, fretCount, chord){
    const matrix = []
    tune.forEach((item, index) => {
        matrix[index] = []
        const indexOfCurrentItem = scale.indexOf(item)
        let i = 0
        while(i < fretCount){
            const currentNote = scale[(i + indexOfCurrentItem) % scale.length]
            if(chord.includes(currentNote)){
                matrix[index].push({[currentNote]: i})
            }
            i++
        }
    })
    return matrix
}

function findAllCombinations(arrs) {
    function cartesian(result, item){
        let newResult = []
        for(let i = 0; i < result.length; i++){
            for(let k = 0; k<item.length; k++){
                newResult.push([...result[i], item[k]])
            }
        }
        return newResult
    }
    let result = [[]]
    arrs.forEach(item => {
      result = cartesian(result, item)
    })

    return result
}

function filterOnlyUniqNotesCombinations(combinations){
    return combinations.filter(item => {
        const keysArr = item.map(item => Object.keys(item)[0])
        return keysArr.length === new Set(keysArr).size
    })
}

function filterComfortableStretchCombinations(combinations, stretch){
    return combinations.filter(item => {
        const greaterNullValues = item.map(item => Object.values(item)[0]).filter(item => item > 0)
        if(greaterNullValues.length === 0){
            return true
        }
        const {max, min} = greaterNullValues.reduce((acc, item) => {
            if(item >= acc.max){
                acc.max = item
            }
            if(item < acc.min){
                acc.min = item
            }
            return acc
        }, {max:greaterNullValues[0], min: greaterNullValues[0]})
        return (max - min + 1) <= stretch
    })
}

function getChord(rootNote, chordType){
    const chordsStructure = {
        major: [0,4,7],
        minor: [0,3,7],
    }
    const index = scale.indexOf(rootNote)
    return chordsStructure[chordType].map(item => scale[(index + item) % scale.length])
}






onmessage = function(event) {
    const {fretsCount, stretch, chordType, instrumentTune, rootNote} = event.data
    const chord = getChord(rootNote, chordType)
    const tune = instrumentTune.split(',')
    const frets = findMatchFrets(scale, tune, fretsCount, chord)
    const allCombinations = findAllCombinations(frets)
    const filteredOnlyUniqNotesCombinations = filterOnlyUniqNotesCombinations(allCombinations)
    const filteredComfortableStretchCombinations = filterComfortableStretchCombinations(filteredOnlyUniqNotesCombinations, stretch)
    const readyData = filteredComfortableStretchCombinations.map(item => {
        return item.map(item => Object.values(item)[0])
    })
    postMessage({data: readyData, tune});
};

