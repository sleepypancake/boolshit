document.addEventListener("DOMContentLoaded", addValues);

const rangeToPersent = (min, max, val) => {
    return (val - min) * 100 / (max - min)
}

/**
 * вернет существительное в нужном падеже
 * declOfNum(1, ['минута', 'минуты', 'минут']); // вернёт — минута
 * @param {number} n - число, от которого зависит падеж следующего сущ-ного
 * @param {string[], length: 3} text_forms  - массив из падежных форм
 * @returns {string} - возвращает строку из массива в нужном падеже
 */
const declOfNum = (n, text_forms) => {  
    n = Math.abs(n) % 100; 
    var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}

const setValToRange = (item) => {
    const $rangeVal = $(item).siblings('.range-progress');
    const $rangeOutput = $(item).siblings('.range-output');

    if ($(item).data("type") === "years") {
        $rangeOutput.html(`${item.value} ${declOfNum(item.value, ['год', 'года', 'лет'])}`)
    } else  {
        $rangeOutput.html(parseInt(item.value).toLocaleString())
    }
    $rangeVal.css('width', rangeToPersent(+item.min, +item.max, +item.value) + '%')
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
