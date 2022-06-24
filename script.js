document.addEventListener("DOMContentLoaded", addValues);

const rangeToPersent = (min, max, val) => {
    console.log((val - min) * 100 / (max - min))
    return (val - min) * 100 / (max - min)
}

const setValToRange = (item) => {
    const rangeVal = $(item).siblings('.range-value');

    console.log(item, +item.min, +item.max, +item.value)
    $(rangeVal).css('width', rangeToPersent(+item.min, +item.max, +item.value) + '%')
}

function addValues () {
    const ranges = document.querySelectorAll('input[type="range"]')
    for (let range of ranges) {
        setValToRange(range) 
    }
}

$( 'input[type="range"]' ).on( 'input', (e) => {
    e.target.classList.add('active')
    setValToRange(e.target)
  } 
);

$( 'input[type="range"]' ).on( 'blur', (e) => {
    e.target.classList.remove('active')
  } 
);
